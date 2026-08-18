"use client";

import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTransition} from "react";
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
  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <details>
          <summary className="cursor-pointer list-none text-lg font-bold">Create deck</summary>
          <div className="mt-5">
            <DeckForm submitLabel="Create deck" onSubmit={createDeckAction} />
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
        <Stat label="Total" value={deck.wordCount} />
        <Stat label="Due" value={deck.dueCount} />
        <Stat label="Learning" value={deck.learningCount} />
        <Stat label="Mastered" value={deck.masteredCount} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button
          disabled={pending}
          size="icon"
          type="button"
          variant="glass"
          onClick={() => startTransition(() => void moveDeckAction(deck.id, "up"))}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          disabled={pending}
          size="icon"
          type="button"
          variant="glass"
          onClick={() => startTransition(() => void moveDeckAction(deck.id, "down"))}
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          className="col-span-2"
          disabled={pending}
          type="button"
          variant="destructive"
          onClick={() => startTransition(() => void deleteDeckAction(deck.id))}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
      <details>
        <summary className="cursor-pointer list-none text-sm font-bold text-primary">Rename / edit</summary>
        <div className="mt-4">
          <DeckForm deck={deck} submitLabel="Save deck" onSubmit={(values) => updateDeckAction(deck.id, values)} />
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
      <Input {...register("name")} placeholder="Deck name" />
      <Input {...register("description")} placeholder="Description" />
      <Controller
        control={control}
        name="color"
        render={({field}) => (
          <Select value={field.value ?? "emerald"} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Deck color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emerald">Emerald</SelectItem>
              <SelectItem value="cyan">Cyan</SelectItem>
              <SelectItem value="amber">Amber</SelectItem>
              <SelectItem value="rose">Rose</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <Button disabled={pending} type="submit" className="w-full">
        <Save className="size-4" />
        {pending ? "Saving..." : submitLabel}
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
