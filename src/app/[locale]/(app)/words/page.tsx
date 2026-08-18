import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {WordsManager} from "@/features/vocabulary/components/words-manager";
import {getDecks, getTags, getWords} from "@/features/vocabulary/services/vocabulary-service";
import type {CardFilters} from "@/features/vocabulary/types";

type WordsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WordsPage({searchParams}: WordsPageProps) {
  const t = await getTranslations("Words");
  const params = await searchParams;
  const filters = toFilters(params);
  const [words, decks, tags] = await Promise.all([getWords(filters), getDecks(), getTags()]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <WordsManager words={words} decks={decks} tags={tags} filters={filters} />
    </div>
  );
}

function toFilters(params: Record<string, string | string[] | undefined>): CardFilters {
  const filters: CardFilters = {};
  const search = first(params.search);
  const deckId = first(params.deckId);
  const tag = first(params.tag);
  const status = first(params.status) as CardFilters["status"];
  const favorite = first(params.favorite) as CardFilters["favorite"];
  const sort = first(params.sort) as CardFilters["sort"];

  if (search) filters.search = search;
  if (deckId) filters.deckId = deckId;
  if (tag) filters.tag = tag;
  if (status) filters.status = status;
  if (favorite) filters.favorite = favorite;
  if (sort) filters.sort = sort;

  return filters;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
