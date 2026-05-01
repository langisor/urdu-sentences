import { Suspense } from "react";
import Link from "next/link";
import { Loader2, BookOpen, Search as SearchIcon } from "lucide-react";
import { searchSentences, getAllSentences } from "@/app/actions/search";
import SearchBar from "@/components/search/search-bar";
import ResultsTable from "@/components/search/results-table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Search Sentences" };

// ── Results ───────────────────────────────────────────────────────────────────

async function Results({ query }: { query: string }) {
  // No query → show everything
  const results = query.trim()
    ? await searchSentences(query)
    : await getAllSentences();

  if (!results.length) {
    return (
      <p className="text-center text-muted-foreground text-sm py-16">
        {query.trim()
          ? <>No results for <span className="font-medium text-foreground">"{query}"</span>.</>
          : "No sentences found in the database."}
      </p>
    );
  }

  return <ResultsTable data={results} query={query} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary/10">
                <SearchIcon className="size-4 sm:size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-semibold leading-none">Urdu Sentences</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
                  Search &amp; Explore
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 h-8 sm:h-9">
              <Link href="/api-help">
                <BookOpen className="size-3.5 sm:size-4" />
                <span className="text-xs sm:text-sm">API Docs</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 lg:py-10 w-full flex flex-col gap-6 sm:gap-8 lg:gap-10">
        <div className="flex flex-col gap-1 lg:gap-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">Sentence Search</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
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
          <Results query={q} />
        </Suspense>
      </section>

      </main>
    </div>
  );
}