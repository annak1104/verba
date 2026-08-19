"use client";

import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Heart, Pencil, Search, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {GlassCard} from "@/components/ui/glass-card";
import {EmptyState} from "@/components/ui/state-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {SpeakerButton} from "@/features/pronunciation/components/speaker-button";
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
  const t = useTranslations("Words");

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <details>
          <summary className="cursor-pointer list-none text-lg font-bold">{t("createWord")}</summary>
          <div className="mt-5">
            <WordForm decks={decks} submitLabel={t("createWord")} onSubmit={createCardAction} />
          </div>
        </details>
      </GlassCard>

      <WordsFilters decks={decks} tags={tags} filters={filters} />

      {words.length === 0 ? (
        <EmptyState title={t("noMatchTitle")} description={t("noMatchDescription")} />
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
  const t = useTranslations("Words");
  const tCommon = useTranslations("Common");

  return (
    <GlassCard className="p-4">
      <form className="grid gap-2 sm:grid-cols-[1fr_10rem_9rem_9rem_8rem]">
        <label className="glass-control flex h-12 items-center gap-2 rounded-2xl px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            defaultValue={filters.search ?? ""}
            name="search"
            placeholder={t("searchPlaceholder")}
          />
        </label>
        <FilterSelect defaultValue={filters.deckId ?? "all"} name="deckId" placeholder={t("allDecks")}>
          <SelectItem value="all">{t("allDecks")}</SelectItem>
          {decks.map((deck) => (
            <SelectItem key={deck.id} value={deck.id}>
              {deck.name}
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect defaultValue={filters.status ?? "all"} name="status" placeholder={t("allStates")}>
          <SelectItem value="all">{t("allStates")}</SelectItem>
          <SelectItem value="new">{t("memory.new")}</SelectItem>
          <SelectItem value="learning">{t("memory.learning")}</SelectItem>
          <SelectItem value="reviewing">{t("memory.reviewing")}</SelectItem>
          <SelectItem value="mastered">{t("memory.mastered")}</SelectItem>
        </FilterSelect>
        <FilterSelect defaultValue={filters.tag ?? "all"} name="tag" placeholder={t("allTags")}>
          <SelectItem value="all">{t("allTags")}</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.name}>
              {tag.name}
            </SelectItem>
          ))}
        </FilterSelect>
        <FilterSelect defaultValue={filters.sort ?? "english"} name="sort" placeholder={t("sort")}>
          <SelectItem value="english">{t("sortAz")}</SelectItem>
          <SelectItem value="created">{t("sortNewest")}</SelectItem>
          <SelectItem value="due">{t("sortDue")}</SelectItem>
          <SelectItem value="difficulty">{t("sortHardest")}</SelectItem>
        </FilterSelect>
        <label className="glass-control flex h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold">
          <input
            defaultChecked={filters.favorite === "true"}
            name="favorite"
            type="checkbox"
            value="true"
          />
          {t("favorites")}
        </label>
        <Button className="sm:col-span-4" type="submit" variant="glass">
          {tCommon("applyFilters")}
        </Button>
      </form>
    </GlassCard>
  );
}

function WordRow({word, decks}: Readonly<{word: Word; decks: Deck[]}>) {
  const t = useTranslations("Words");
  const tCommon = useTranslations("Common");
  const tPronunciation = useTranslations("Pronunciation");
  const [pending, startTransition] = useTransition();

  return (
    <GlassCard interactive className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-bold">{word.term}</h2>
            <SpeakerButton
              className="size-9 rounded-xl"
              label={tPronunciation("speakEnglish")}
              text={word.term}
            />
            {word.favorite ? <Heart className="size-4 fill-primary text-primary" /> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{word.meaning}</p>
          <p className="mt-1 text-xs text-muted-foreground">{word.pronunciation}</p>
        </div>
        <Badge>{word.deckName}</Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="glass-control flex items-center justify-between gap-3 rounded-[22px] p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{t("englishAudio")}</p>
            <p className="truncate text-sm font-semibold">{word.term}</p>
          </div>
          <SpeakerButton label={tPronunciation("speakEnglish")} text={word.term} />
        </div>
        <div className="glass-control rounded-[22px] p-4">
          <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{t("pronunciation")}</p>
          <p className="mt-1 text-sm font-semibold">{word.pronunciation || tCommon("notSet")}</p>
          {word.ipa ? <p className="mt-1 text-xs text-muted-foreground">{t("ipa")}: {word.ipa}</p> : null}
        </div>
      </div>

      {word.example ? <p className="glass-control rounded-[22px] p-4 text-sm">{word.example}</p> : null}
      {word.notes ? <p className="text-sm leading-6 text-muted-foreground">{word.notes}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{t(`memory.${word.memoryState}`)}</Badge>
        <Badge variant="outline">{t("difficulty", {value: word.difficulty})}</Badge>
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
          {tCommon("favorite")}
        </Button>
        <Button
          disabled={pending}
          type="button"
          variant="destructive"
          onClick={() => startTransition(() => void deleteCardAction(word.id))}
        >
          <Trash2 className="size-4" />
          {tCommon("delete")}
        </Button>
        <details className="contents">
          <summary className="glass-control inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-bold">
            <Pencil className="size-4" />
            {tCommon("edit")}
          </summary>
          <div className="col-span-3 pt-2">
            <WordForm
              decks={decks}
              word={word}
              submitLabel={t("saveChanges")}
              onSubmit={(values) => updateCardAction(word.id, values)}
            />
          </div>
        </details>
      </div>
    </GlassCard>
  );
}

function FilterSelect({
  children,
  defaultValue,
  name,
  placeholder
}: Readonly<{children: React.ReactNode; defaultValue: string; name: string; placeholder: string}>) {
  return (
    <Select defaultValue={defaultValue} name={name}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}
