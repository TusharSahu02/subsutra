"use client"

import * as React from "react"
import Link from "next/link"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ExternalLinkIcon,
  HeartIcon,
  Repeat2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Columns3Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SubstackPost } from "@/lib/substack"

function reactionCount(post: SubstackPost) {
  return Object.values(post.reactions ?? {}).reduce((s, v) => s + v, 0)
}

function audienceBadge(audience: string) {
  if (audience === "only_paid")
    return (
      <Badge
        variant="outline"
        className="border-0 text-xs"
        style={{ backgroundColor: "rgba(255,103,25,0.12)", color: "var(--accent-orange)" }}
      >
        Paid
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="border-0 text-xs"
      style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}
    >
      Free
    </Badge>
  )
}

function typeBadge(type: string) {
  return (
    <Badge
      variant="outline"
      className="border-0 text-xs capitalize"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
    >
      {type}
    </Badge>
  )
}

const columns: ColumnDef<SubstackPost>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/posts/${row.original.slug}`}
        className="flex items-center gap-1.5 font-medium hover:underline"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="line-clamp-1 max-w-[280px]">{row.original.title}</span>
        <ExternalLinkIcon className="size-3 shrink-0 opacity-40" />
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => typeBadge(row.original.type),
  },
  {
    accessorKey: "audience",
    header: "Audience",
    cell: ({ row }) => audienceBadge(row.original.audience),
  },
  {
    accessorKey: "post_date",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-xs"
        style={{ color: "var(--text-secondary)" }}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Published
        {column.getIsSorted() === "asc" ? (
          <ChevronUpIcon className="size-3" />
        ) : (
          <ChevronDownIcon className="size-3" />
        )}
      </button>
    ),
    cell: ({ row }) =>
      new Date(row.original.post_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    sortingFn: "datetime",
  },
  {
    id: "reactions",
    header: ({ column }) => (
      <button
        className="flex w-full items-center justify-end gap-1 text-xs"
        style={{ color: "var(--text-secondary)" }}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <HeartIcon className="size-3" />
        {column.getIsSorted() === "asc" ? (
          <ChevronUpIcon className="size-3" />
        ) : (
          <ChevronDownIcon className="size-3" />
        )}
      </button>
    ),
    accessorFn: reactionCount,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 tabular-nums" style={{ color: "var(--text-secondary)" }}>
        <HeartIcon className="size-3" />
        {reactionCount(row.original)}
      </div>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "restacks",
    header: ({ column }) => (
      <button
        className="flex w-full items-center justify-end gap-1 text-xs"
        style={{ color: "var(--text-secondary)" }}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <Repeat2Icon className="size-3" />
        {column.getIsSorted() === "asc" ? (
          <ChevronUpIcon className="size-3" />
        ) : (
          <ChevronDownIcon className="size-3" />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 tabular-nums" style={{ color: "var(--text-secondary)" }}>
        <Repeat2Icon className="size-3" />
        {row.original.restacks ?? 0}
      </div>
    ),
    sortingFn: "basic",
  },
]

interface Props {
  posts: SubstackPost[]
}

export function PostsTable({ posts }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "post_date", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data: posts,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* toolbar */}
      <div className="flex items-center justify-between">
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Posts
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter posts…"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            className="h-8 w-48 text-xs"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
                />
              }
            >
              <Columns3Icon data-icon="inline-start" />
              Columns
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {col.id === "reactions" ? "Reactions" : col.id === "restacks" ? "Restacks" : col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* table */}
      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} style={{ borderColor: "var(--border-subtle)" }}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-white/[0.03]"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <div className="hidden text-xs lg:block" style={{ color: "var(--text-secondary)" }}>
          {table.getFilteredRowModel().rows.length} post(s)
        </div>
        <div className="flex w-full items-center gap-6 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Rows
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
              items={[10, 20, 50].map((n) => ({ label: `${n}`, value: `${n}` }))}
            >
              <SelectTrigger size="sm" className="w-16" id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={`${n}`}>{n}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 text-center text-xs lg:flex-none" style={{ color: "var(--text-secondary)" }}>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Button variant="outline" size="icon" className="hidden size-7 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeftIcon className="size-3" />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeftIcon className="size-3" />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRightIcon className="size-3" />
            </Button>
            <Button variant="outline" size="icon" className="hidden size-7 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRightIcon className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
