"use client";

import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {ArrowDown, ArrowUp, Save, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Progress} from "@/components/ui/progress";
import {GlassCard} from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  deckFormSchema,
  type DeckFormInput,
  type DeckFormValues
} from "@/features/vocabulary/schemas";
import {
  createDeckAction,
  deleteDeckAction,
  moveDeckAction,
  updateDeckAction
} from "@/features/vocabulary/actions";
import type {Deck} from "@/features/vocabulary/types";

export function DecksManager({decks}: Readonly<{decks: Deck[]}>) {
  const t = useTranslations("Decks");

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <details>
          <summary className="cursor-pointer list-none text-lg font-bold">{t("createDeck")}</summary>
          <div className="mt-5">
            <DeckForm submitLabel={t("createDeck")} onSubmit={createDeckAction} />
          </div>
        </details>
      </GlassCard>
      <div className="grid gap-3 lg:grid-cols-2">
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    </div>
  );
}

function DeckCard({deck}: Readonly<{deck: Deck}>) {
  const t = useTranslations("Decks");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();

  return (
    <GlassCard interactive className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{deck.name}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{deck.description}</p>
        </div>
        <div className="text-right text-sm font-bold">{deck.progress}%</div>
      </div>
      <Progress value={deck.progress} />
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-muted-foreground">
        <Stat label={t("total")} value={deck.wordCount} />
        <Stat label={t("due")} value={deck.dueCount} />
        <Stat label={t("learning")} value={deck.learningCount} />
        <Stat label={t("mastered")} value={deck.masteredCount} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button
          className="size-12"
          disabled={pending}
          size="icon"
          type="button"
          variant="glass"
          onClick={() => startTransition(() => void moveDeckAction(deck.id, "up"))}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          className="size-12"
          disabled={pending}
          size="icon"
          type="button"
          variant="glass"
          onClick={() => startTransition(() => void moveDeckAction(deck.id, "down"))}
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          className="col-span-2 min-h-12 px-5 py-3 text-sm sm:text-base"
          disabled={pending}
          type="button"
          variant="destructive"
          onClick={() => startTransition(() => void deleteDeckAction(deck.id))}
        >
          <Trash2 className="size-4" />
          {tCommon("delete")}
        </Button>
      </div>
      <details>
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-2xl px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {t("renameEdit")}
        </summary>
        <div className="mt-4">
          <DeckForm deck={deck} submitLabel={t("saveDeck")} onSubmit={(values) => updateDeckAction(deck.id, values)} />
        </div>
      </details>
    </GlassCard>
  );
}

function DeckForm({
  deck,
  submitLabel,
  onSubmit
}: Readonly<{
  deck?: Deck;
  submitLabel: string;
  onSubmit: (values: DeckFormValues) => Promise<{ok: boolean; message: string}>;
}>) {
  const t = useTranslations("Decks");
  const tCommon = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  const {control, register, handleSubmit} = useForm<DeckFormInput, unknown, DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: deck?.name ?? "",
      description: deck?.description ?? "",
      color: deck?.color ?? "emerald"
    }
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => startTransition(() => void onSubmit(values)))}
    >
      <Input {...register("name")} placeholder={t("deckName")} />
      <Input {...register("description")} placeholder={t("description")} />
      <Controller
        control={control}
        name="color"
        render={({field}) => (
          <Select value={field.value ?? "emerald"} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("deckColor")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emerald">{t("colors.emerald")}</SelectItem>
              <SelectItem value="cyan">{t("colors.cyan")}</SelectItem>
              <SelectItem value="amber">{t("colors.amber")}</SelectItem>
              <SelectItem value="rose">{t("colors.rose")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <Button disabled={pending} type="submit" className="w-full">
        <Save className="size-4" />
        {pending ? tCommon("saving") : submitLabel}
      </Button>
    </form>
  );
}

function Stat({label, value}: Readonly<{label: string; value: number}>) {
  return (
    <div className="glass-control rounded-2xl p-2">
      <div className="text-base text-foreground">{value}</div>
      <div>{label}</div>
    </div>
  );
}
