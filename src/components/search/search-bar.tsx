"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import type { SearchField } from "@/app/actions/search";
import { cn } from "@/lib/utils";

const FIELDS: { value: SearchField; label: string; dir?: "rtl" }[] = [
  { value: "all",  label: "All"     },
  { value: "eng",  label: "English" },
  { value: "urdu", label: "اردو",  dir: "rtl" },
  { value: "arb",  label: "عربي",  dir: "rtl" },
];

export default function SearchBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q    = searchParams.get("q")    ?? "";
  const lang = (searchParams.get("lang") ?? "all") as SearchField;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) =>
        v ? params.set(k, v) : params.delete(k)
      );
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex flex-col gap-3">

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />

        <Input
          type="search"
          placeholder="Search sentences…"
          defaultValue={q}
          onChange={(e) => updateParams({ q: e.target.value, lang })}
          className="pl-9 pr-9 h-11 text-base"
          aria-label="Search query"
          autoFocus
        />

        {isPending && (
          <Loader2 className="absolute right-3 size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Language filter">
        {FIELDS.map(({ value, label, dir }) => (
          <Button
            key={value}
            role="tab"
            aria-selected={lang === value}
            variant={lang === value ? "default" : "outline"}
            size="sm"
            dir={dir}
            onClick={() => updateParams({ q, lang: value })}
            className={cn(
              "rounded-full text-sm transition-all",
              lang === value && "shadow-none",
              value === "urdu" && "urdu",
              value === "arb" && "arabic"
            )}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}