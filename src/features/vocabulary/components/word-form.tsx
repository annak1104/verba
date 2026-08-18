"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useTransition} from "react";
import {Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
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
  const [pending, startTransition] = useTransition();
  const {
    register,
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
        <Field label="English" error={errors.english?.message}>
          <Input {...register("english")} autoComplete="off" />
        </Field>
        <Field label="Ukrainian translation" error={errors.ukrainianTranslation?.message}>
          <Input {...register("ukrainianTranslation")} autoComplete="off" />
        </Field>
        <Field label="Ukrainian phonetic pronunciation" error={errors.ukrainianPronunciation?.message}>
          <Input {...register("ukrainianPronunciation")} autoComplete="off" />
        </Field>
        <Field label="IPA" error={errors.ipa?.message}>
          <Input {...register("ipa")} autoComplete="off" placeholder="/wɜːd/" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="English example" error={errors.exampleEnglish?.message}>
          <Textarea {...register("exampleEnglish")} />
        </Field>
        <Field label="Ukrainian example" error={errors.exampleUkrainian?.message}>
          <Textarea {...register("exampleUkrainian")} />
        </Field>
      </div>

      <Field label="Notes" error={errors.notes?.message}>
        <Textarea {...register("notes")} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
        <Field label="Deck" error={errors.deckId?.message}>
          <select
            className="glass-control h-12 w-full rounded-2xl px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            {...register("deckId")}
          >
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tags" error={errors.tags?.message}>
          <Input {...register("tags")} placeholder="travel, work" />
        </Field>
        <Field label="Difficulty" error={errors.difficulty?.message}>
          <Input {...register("difficulty", {valueAsNumber: true})} min={1} max={5} type="number" />
        </Field>
      </div>

      <label className="glass-control flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold">
        <input className="size-4 accent-primary" type="checkbox" {...register("favorite")} />
        Favorite
      </label>

      <Button className="w-full" disabled={pending || decks.length === 0} type="submit">
        <Save className="size-4" />
        {pending ? "Saving..." : submitLabel}
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
