"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Controller, useForm} from "react-hook-form";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Save} from "lucide-react";
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
import type {VocabularyActionState} from "@/features/vocabulary/actions";

export function WordForm({
  decks,
  word,
  submitLabel,
  onSubmit
}: Readonly<{
  decks: Deck[];
  word?: Word;
  submitLabel: string;
  onSubmit: (values: CardFormValues) => Promise<VocabularyActionState>;
}>) {
  const t = useTranslations("WordForm");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: {errors},
    reset
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
          <Input {...register("english")} autoComplete="off" />
        </Field>
        <Field label={t("ukrainianTranslation")} error={errors.ukrainianTranslation ? t("validation") : undefined}>
          <Input {...register("ukrainianTranslation")} autoComplete="off" />
        </Field>
        <Field label={t("ukrainianPronunciation")} error={errors.ukrainianPronunciation ? t("validation") : undefined}>
          <Input {...register("ukrainianPronunciation")} autoComplete="off" />
        </Field>
        <Field label={t("ipa")} error={errors.ipa ? t("validation") : undefined}>
          <Input {...register("ipa")} autoComplete="off" placeholder="/wɜːd/" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("englishExample")} error={errors.exampleEnglish ? t("validation") : undefined}>
          <Textarea {...register("exampleEnglish")} />
        </Field>
        <Field label={t("ukrainianExample")} error={errors.exampleUkrainian ? t("validation") : undefined}>
          <Textarea {...register("exampleUkrainian")} />
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

      <Button className="w-full" disabled={pending || decks.length === 0} type="submit">
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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="glass-control min-h-24 w-full resize-y rounded-2xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
      {...props}
    />
  );
}
