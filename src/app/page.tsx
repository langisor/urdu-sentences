import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { searchSentences, getAllSentences, type SearchField } from "@/app/actions/search";
import SearchBar from "@/components/search/search-bar";
import ResultsTable from "@/components/search/results-table";

export const metadata = { title: "Search Sentences" };

const FIELD_LABEL: Record<string, string> = {
  eng: "English", urdu: "Urdu", arb: "Arabic",
};

// ── Results ───────────────────────────────────────────────────────────────────

async function Results({ query, lang }: { query: string; lang: SearchField }) {
  // No query → show everything
  const results = query.trim()
    ? await searchSentences(query, lang)
    : await getAllSentences();

  if (!results.length) {
    return (
      <p className="text-center text-muted-foreground text-sm py-16">
        {query.trim()
          ? <>No results for <span className="font-medium text-foreground">"{query}"</span>
              {lang !== "all" && ` in ${FIELD_LABEL[lang]}`}.</>
          : "No sentences found in the database."}
      </p>
    );
  }

  return <ResultsTable data={results} query={query} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface SearchPageProps {
  searchParams: Promise<{ q?: string; lang?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", lang = "all" } = await searchParams;

  return (
    <main className="max-w-5xl mx-auto px-5 py-10 flex flex-col gap-8">

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sentence Search</h1>
        <p className="text-sm text-muted-foreground">
          Search across English, Urdu &amp; Arabic
        </p>
      </div>

      <Suspense fallback={<div className="h-11 rounded-md bg-muted animate-pulse" />}>
        <SearchBar />
      </Suspense>

      <section aria-live="polite">
        <Suspense fallback={
          <div className="flex justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        }>
          <Results query={q} lang={lang as SearchField} />
        </Suspense>
      </section>

    </main>
  );
}