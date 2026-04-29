"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/app/actions/search";
import { cn } from "@/lib/utils";

// ── Highlight helper ──────────────────────────────────────────────────────────

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts   = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100 rounded-sm px-px"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ── Badge per matched field ───────────────────────────────────────────────────

const FIELD_BADGE: Record<string, string> = {
  eng:  "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  urdu: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  arb:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

const FIELD_LABEL: Record<string, string> = {
  eng: "English", urdu: "Urdu", arb: "Arabic", all: "All",
};

// ── Column definitions ────────────────────────────────────────────────────────

function buildColumns(query: string): ColumnDef<SearchResult>[] {
  return [
    {
      accessorKey: "id",
      header: "#",
      size: 60,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "matchedField",
      header: "Match",
      size: 90,
      cell: ({ row }) => {
        const field = row.getValue<string>("matchedField");
        return (
          <Badge
            variant="secondary"
            className={cn("text-[11px] px-2 py-0.5 rounded-full", FIELD_BADGE[field])}
          >
            {FIELD_LABEL[field] ?? field}
          </Badge>
        );
      },
    },
    {
      accessorKey: "eng",
      header: "English",
      cell: ({ row }) => (
        <p className="text-sm md:text-base leading-relaxed">
          <Highlighted text={row.getValue("eng")} query={query} />
        </p>
      ),
    },
    {
      accessorKey: "urdu",
      header: "Urdu",
      cell: ({ row }) => (
        <p
          dir="rtl"
          className="urdu text-right text-base md:text-lg leading-loose"
        >
          <Highlighted text={row.getValue("urdu")} query={query} />
        </p>
      ),
    },
    {
      accessorKey: "arb",
      header: "Arabic",
      cell: ({ row }) => (
        <p dir="rtl" className="arabic text-right text-base md:text-lg leading-loose">
          <Highlighted text={row.getValue("arb")} query={query} />
        </p>
      ),
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface ResultsTableProps {
  data:  SearchResult[];
  query: string;
}

export default function ResultsTable({ data, query }: ResultsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters,    setColumnFilters]    = useState<ColumnFiltersState>([]);

  const columns = buildColumns(query);

  const table = useReactTable({
    data,
    columns,
    state:    { columnVisibility, columnFilters },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange:    setColumnFilters,
    getCoreRowModel:          getCoreRowModel(),
    getPaginationRowModel:    getPaginationRowModel(),
    initialState:             { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows  = table.getFilteredRowModel().rows.length;
  const pageCount  = table.getPageCount();
  const firstRow   = pageIndex * pageSize + 1;
  const lastRow    = Math.min(firstRow + pageSize - 1, totalRows);

  return (
    <div className="flex flex-col gap-4 md:gap-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <p className="text-xs md:text-sm text-muted-foreground">
          {totalRows} result{totalRows !== 1 ? "s" : ""}
          {query && (
            <span className="hidden sm:inline">
              {" "}for <span className="font-medium text-foreground">"{query}"</span>
            </span>
          )}
        </p>

        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs md:text-sm">
              Columns <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize text-sm"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(val)}
                >
                  {FIELD_LABEL[col.id] ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Table ── */}
      <div className="rounded-md border overflow-x-auto lg:overflow-visible">
        <Table className="min-w-[640px] lg:min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                    className="text-xs font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="align-top">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground text-sm"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">

        {/* Rows per page */}
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 text-xs md:text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <span className="text-xs md:text-sm text-muted-foreground">
          {firstRow}–{lastRow} of {totalRows}
        </span>

        {/* Navigation buttons */}
        <div className="flex items-center justify-center sm:justify-start gap-1 w-full sm:w-auto">
          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="text-xs md:text-sm text-muted-foreground px-2 md:px-3 tabular-nums">
            {pageIndex + 1} / {pageCount || 1}
          </span>

          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}