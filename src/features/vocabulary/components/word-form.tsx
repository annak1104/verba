"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Controller, useForm} from "react-hook-form";
import {useRef, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Save, Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  cardFormSchema,
  type CardFormInput,
  type CardFormValues
} from "@/features/vocabulary/schemas";
import type {Deck, Word} from "@/features/vocabulary/types";
import type {
  GenerateWordCardState,
  VocabularyActionState
} from "@/features/vocabulary/actions";

const aiGeneratedFields = [
  "ukrainianTranslation",
  "ukrainianPronunciation",
  "ipa",
  "exampleEnglish",
  "exampleUkrainian"
] as const;
type AiGeneratedField = (typeof aiGeneratedFields)[number];

export function WordForm({
  decks,
  word,
  submitLabel,
  onSubmit,
  onGenerateWordCard,
  aiAvailable
}: Readonly<{
  decks: Deck[];
  word?: Word;
  submitLabel: string;
  onSubmit: (values: CardFormValues) => Promise<VocabularyActionState>;
  onGenerateWordCard: (values: {
    english: string;
    locale: "en" | "uk";
    context: Partial<Record<AiGeneratedField, string>>;
    requestedFields: AiGeneratedField[];
  }) => Promise<GenerateWordCardState>;
  aiAvailable: boolean;
}>) {
  const t = useTranslations("WordForm");
  const tCommon = useTranslations("Common");
  const locale = useLocale() === "uk" ? "uk" : "en";
  const [pending, startTransition] = useTransition();
  const [aiPending, setAiPending] = useState(false);
  const [activeAiRequest, setActiveAiRequest] = useState<AiGeneratedField | "missing" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiRequestPendingRef = useRef(false);
  const {
    register,
    control,
    handleSubmit,
    formState: {errors},
    getValues,
    reset,
    setValue
  } = useForm<CardFormInput, unknown, CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      deckId: word?.deckId ?? decks[0]?.id ?? "",
      english: word?.term ?? "",
      ukrainianTranslation: word?.meaning ?? "",
      ukrainianPronunciation: word?.pronunciation ?? "",
      ipa: word?.ipa ?? "",
      exampleEnglish: word?.example ?? "",
      exampleUkrainian: word?.exampleUkrainian ?? "",
      notes: word?.notes ?? "",
      favorite: word?.favorite ?? false,
      difficulty: word?.difficulty ?? 1,
      tags: word?.tags.map((tag) => tag.name).join(", ") ?? ""
    }
  });

  function getAiContext() {
    return aiGeneratedFields.reduce<Partial<Record<AiGeneratedField, string>>>(
      (context, field) => {
        const value = String(getValues(field) ?? "").trim();
        if (value) {
          context[field] = value;
        }

        return context;
      },
      {}
    );
  }

  function hasFieldValue(field: AiGeneratedField) {
    return String(getValues(field) ?? "").trim().length > 0;
  }

  async function handleAiEnrichment({
    fields,
    request,
    fillOnlyMissing = false
  }: {
    fields: AiGeneratedField[];
    request: AiGeneratedField | "missing";
    fillOnlyMissing?: boolean;
  }) {
    if (aiRequestPendingRef.current) {
      return;
    }

    const english = String(getValues("english") ?? "").trim();
    if (!english) {
      setAiError(t("aiWordRequired"));
      return;
    }

    const fieldsToApply = fillOnlyMissing
      ? fields.filter((field) => !hasFieldValue(field))
      : fields;
    if (fieldsToApply.length === 0) {
      setAiError(t("aiNoMissingFields"));
      return;
    }

    const wouldOverwrite = fieldsToApply.some((field) => hasFieldValue(field));
    if (wouldOverwrite && !window.confirm(t("aiOverwriteConfirm"))) {
      return;
    }

    aiRequestPendingRef.current = true;
    setAiPending(true);
    setActiveAiRequest(request);
    setAiError(null);

    try {
      const result = await onGenerateWordCard({
        english,
        locale,
        context: getAiContext(),
        requestedFields: fieldsToApply
      });
      if (!result.ok) {
        setAiError(result.message);
        return;
      }

      for (const field of fieldsToApply) {
        setValue(field, result.values[field], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
    } catch {
      setAiError(t("aiUnavailable"));
    } finally {
      aiRequestPendingRef.current = false;
      setAiPending(false);
      setActiveAiRequest(null);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const result = await onSubmit(values);
          if (result.ok && !word) {
            reset({
              deckId: decks[0]?.id ?? "",
              english: "",
              ukrainianTranslation: "",
              ukrainianPronunciation: "",
              ipa: "",
              exampleEnglish: "",
              exampleUkrainian: "",
              notes: "",
              favorite: false,
              difficulty: 1,
              tags: ""
            });
          }
        });
      })}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("english")} error={errors.english ? t("validation") : undefined}>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input {...register("english")} autoComplete="off" />
            {aiAvailable ? (
              <Button
                className="px-3"
                disabled={aiPending || pending}
                size="sm"
                type="button"
                variant="glass"
                onClick={() =>
                  void handleAiEnrichment({
                    fields: [...aiGeneratedFields],
                    request: "missing",
                    fillOnlyMissing: true
                  })
                }
              >
                <Sparkles className="size-4" />
                {activeAiRequest === "missing" ? t("aiFilling") : t("aiFillMissing")}
              </Button>
            ) : null}
          </div>
          {aiError ? <p className="px-1 text-sm text-destructive">{aiError}</p> : null}
        </Field>
        <Field label={t("ukrainianTranslation")} error={errors.ukrainianTranslation ? t("validation") : undefined}>
          <AiInput
            aiAvailable={aiAvailable}
            buttonLabel={t("aiTranslate")}
            disabled={aiPending || pending}
            loading={activeAiRequest === "ukrainianTranslation"}
            loadingLabel={t("aiGenerating")}
            onGenerate={() =>
              void handleAiEnrichment({
                fields: ["ukrainianTranslation"],
                request: "ukrainianTranslation"
              })
            }
          >
            <Input {...register("ukrainianTranslation")} autoComplete="off" />
          </AiInput>
        </Field>
        <Field label={t("ukrainianPronunciation")} error={errors.ukrainianPronunciation ? t("validation") : undefined}>
          <AiInput
            aiAvailable={aiAvailable}
            buttonLabel={t("aiRegenerate")}
            disabled={aiPending || pending}
            loading={activeAiRequest === "ukrainianPronunciation"}
            loadingLabel={t("aiGenerating")}
            onGenerate={() =>
              void handleAiEnrichment({
                fields: ["ukrainianPronunciation"],
                request: "ukrainianPronunciation"
              })
            }
          >
            <Input {...register("ukrainianPronunciation")} autoComplete="off" />
          </AiInput>
        </Field>
        <Field label={t("ipa")} error={errors.ipa ? t("validation") : undefined}>
          <AiInput
            aiAvailable={aiAvailable}
            buttonLabel={t("aiRegenerate")}
            disabled={aiPending || pending}
            loading={activeAiRequest === "ipa"}
            loadingLabel={t("aiGenerating")}
            onGenerate={() =>
              void handleAiEnrichment({
                fields: ["ipa"],
                request: "ipa"
              })
            }
          >
            <Input {...register("ipa")} autoComplete="off" placeholder="/wɜːd/" />
          </AiInput>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("englishExample")} error={errors.exampleEnglish ? t("validation") : undefined}>
          <AiInput
            aiAvailable={aiAvailable}
            buttonLabel={t("aiRegenerate")}
            disabled={aiPending || pending}
            loading={activeAiRequest === "exampleEnglish"}
            loadingLabel={t("aiGenerating")}
            onGenerate={() =>
              void handleAiEnrichment({
                fields: ["exampleEnglish"],
                request: "exampleEnglish"
              })
            }
          >
            <Textarea {...register("exampleEnglish")} />
          </AiInput>
        </Field>
        <Field label={t("ukrainianExample")} error={errors.exampleUkrainian ? t("validation") : undefined}>
          <AiInput
            aiAvailable={aiAvailable}
            buttonLabel={t("aiRegenerate")}
            disabled={aiPending || pending}
            loading={activeAiRequest === "exampleUkrainian"}
            loadingLabel={t("aiGenerating")}
            onGenerate={() =>
              void handleAiEnrichment({
                fields: ["exampleUkrainian"],
                request: "exampleUkrainian"
              })
            }
          >
            <Textarea {...register("exampleUkrainian")} />
          </AiInput>
        </Field>
      </div>

      <Field label={t("notes")} error={errors.notes ? t("validation") : undefined}>
        <Textarea {...register("notes")} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
        <Field label={t("deck")} error={errors.deckId ? t("validation") : undefined}>
          <Controller
            control={control}
            name="deckId"
            render={({field}) => (
              <Select disabled={decks.length === 0} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("chooseDeck")} />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label={t("tags")} error={errors.tags ? t("validation") : undefined}>
          <Input {...register("tags")} placeholder={t("tagsPlaceholder")} />
        </Field>
        <Field label={t("difficulty")} error={errors.difficulty ? t("validation") : undefined}>
          <Input {...register("difficulty", {valueAsNumber: true})} min={1} max={5} type="number" />
        </Field>
      </div>

      <label className="glass-control flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold">
        <input className="size-4 accent-primary" type="checkbox" {...register("favorite")} />
        {t("favorite")}
      </label>

      <Button className="w-full" disabled={pending || aiPending || decks.length === 0} type="submit">
        <Save className="size-4" />
        {pending ? tCommon("saving") : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: Readonly<{label: string; error?: string | undefined; children: React.ReactNode}>) {
  return (
    <div className="space-y-2">
      <Label className="px-1 text-[13px] font-bold text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="px-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function AiInput({
  aiAvailable,
  buttonLabel,
  children,
  disabled,
  loading,
  loadingLabel,
  onGenerate
}: Readonly<{
  aiAvailable: boolean;
  buttonLabel: string;
  children: React.ReactNode;
  disabled: boolean;
  loading: boolean;
  loadingLabel: string;
  onGenerate: () => void;
}>) {
  if (!aiAvailable) {
    return children;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
      {children}
      <Button
        className="px-3"
        disabled={disabled}
        size="sm"
        type="button"
        variant="glass"
        onClick={onGenerate}
      >
        <Sparkles className="size-4" />
        {loading ? loadingLabel : buttonLabel}
      </Button>
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="glass-control min-h-24 w-full resize-y rounded-2xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
      {...props}
    />
  );
}
