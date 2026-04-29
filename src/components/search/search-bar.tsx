"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export default function SearchBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="relative flex items-center w-full md:max-w-xl lg:max-w-2xl">
      <Search className="absolute left-3 md:left-3.5 size-4 md:size-5 text-muted-foreground pointer-events-none" />

      <Input
        type="search"
        placeholder="Search across English, Urdu & Arabic…"
        defaultValue={q}
        onChange={(e) => updateQuery(e.target.value)}
        className="w-full pl-10 pr-10 h-10 sm:h-11 md:h-12 text-sm sm:text-base md:text-lg"
        aria-label="Search query"
        autoFocus
      />

      {isPending && (
        <Loader2 className="absolute right-3 md:right-3.5 size-4 md:size-5 text-muted-foreground animate-spin" />
      )}
    </div>
  );
}