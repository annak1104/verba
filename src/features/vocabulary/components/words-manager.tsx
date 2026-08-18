"use client";

import {useTransition} from "react";
import {Heart, Pencil, Search, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {EmptyState} from "@/components/ui/state-view";
import {WordForm} from "@/features/vocabulary/components/word-form";
import {
  createCardAction,
  deleteCardAction,
  toggleFavoriteAction,
  updateCardAction
} from "@/features/vocabulary/actions";
import type {CardFilters, Deck, Word} from "@/features/vocabulary/types";

export function WordsManager({
  words,
  decks,
  tags,
  filters
}: Readonly<{
  words: Word[];
  decks: Deck[];
  tags: Array<{id: string; name: string; color: string}>;
  filters: CardFilters;
}>) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <details>
          <summary className="cursor-pointer list-none text-lg font-bold">Create word</summary>
          <div className="mt-5">
            <WordForm decks={decks} submitLabel="Create word" onSubmit={createCardAction} />
          </div>
        </details>
      </GlassCard>

      <WordsFilters decks={decks} tags={tags} filters={filters} />

      {words.length === 0 ? (
        <EmptyState title="No words match" description="Try a different search or create a new word." />
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <WordRow key={word.id} word={word} decks={decks} />
          ))}
        </div>
      )}
    </div>
  );
}

function WordsFilters({
  decks,
  tags,
  filters
}: Readonly<{decks: Deck[]; tags: Array<{id: string; name: string}>; filters: CardFilters}>) {
  return (
    <GlassCard className="p-4">
      <form className="grid gap-2 sm:grid-cols-[1fr_10rem_9rem_9rem_8rem]">
        <label className="glass-control flex h-12 items-center gap-2 rounded-2xl px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            defaultValue={filters.search ?? ""}
            name="search"
            placeholder="Search words"
          />
        </label>
        <Select defaultValue={filters.deckId ?? ""} name="deckId">
          <option value="">All decks</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </Select>
        <Select defaultValue={filters.status ?? "all"} name="status">
          <option value="all">All states</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="reviewing">Reviewing</option>
          <option value="mastered">Mastered</option>
        </Select>
        <Select defaultValue={filters.tag ?? ""} name="tag">
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </Select>
        <Select defaultValue={filters.sort ?? "english"} name="sort">
          <option value="english">A-Z</option>
          <option value="created">Newest</option>
          <option value="due">Due</option>
          <option value="difficulty">Hardest</option>
        </Select>
        <label className="glass-control flex h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold">
          <input
            defaultChecked={filters.favorite === "true"}
            name="favorite"
            type="checkbox"
            value="true"
          />
          Favorites
        </label>
        <Button className="sm:col-span-4" type="submit" variant="glass">
          Apply filters
        </Button>
      </form>
    </GlassCard>
  );
}

function WordRow({word, decks}: Readonly<{word: Word; decks: Deck[]}>) {
  const [pending, startTransition] = useTransition();

  return (
    <GlassCard interactive className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-bold">{word.term}</h2>
            {word.favorite ? <Heart className="size-4 fill-primary text-primary" /> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{word.meaning}</p>
          <p className="mt-1 text-xs text-muted-foreground">{word.pronunciation}</p>
        </div>
        <Badge>{word.deckName}</Badge>
      </div>

      {word.example ? <p className="glass-control rounded-[22px] p-4 text-sm">{word.example}</p> : null}
      {word.notes ? <p className="text-sm leading-6 text-muted-foreground">{word.notes}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{word.memoryState}</Badge>
        <Badge variant="outline">Difficulty {word.difficulty}</Badge>
        {word.tags.map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          disabled={pending}
          type="button"
          variant="glass"
          onClick={() => startTransition(() => void toggleFavoriteAction(word.id))}
        >
          <Heart className="size-4" />
          Favorite
        </Button>
        <Button
          disabled={pending}
          type="button"
          variant="destructive"
          onClick={() => startTransition(() => void deleteCardAction(word.id))}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
        <details className="contents">
          <summary className="glass-control inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-bold">
            <Pencil className="size-4" />
            Edit
          </summary>
          <div className="col-span-3 pt-2">
            <WordForm
              decks={decks}
              word={word}
              submitLabel="Save changes"
              onSubmit={(values) => updateCardAction(word.id, values)}
            />
          </div>
        </details>
      </div>
    </GlassCard>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="glass-control h-12 rounded-2xl px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    />
  );
}
