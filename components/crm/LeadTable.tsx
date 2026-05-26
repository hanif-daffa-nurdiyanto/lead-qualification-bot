"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react"

import { LeadActionButtons } from "@/components/crm/LeadActionButtons"
import { LeadDetailDialog } from "@/components/crm/LeadDetailDialog"
import { ProcessBadge } from "@/components/crm/ProcessBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatDate, leadProcesses, type CrmLead } from "@/lib/crm"

type LeadTableProps = {
  leads: CrmLead[]
}

function SortButton({
  label,
  column,
}: {
  label: string
  column: {
    toggleSorting: (desc?: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === "asc"
      ? IconArrowUp
      : sorted === "desc"
        ? IconArrowDown
        : IconArrowsSort

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="inline-flex items-center gap-1.5 transition hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}

export function LeadTable({ leads: initialLeads }: LeadTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [updatingId, setUpdatingId] = useState("")
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)
  const [error, setError] = useState("")

  const updateProcess = useCallback(
    async (leadId: string, process: string) => {
      setUpdatingId(leadId)
      setError("")

      const previousLeads = leads
      setLeads((current) =>
        current.map((lead) =>
          lead.id === leadId
            ? { ...lead, process: process as CrmLead["process"] }
            : lead
        )
      )

      try {
        const response = await fetch(`/api/crm/leads/${leadId}/process`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ process }),
        })
        const payload = (await response.json()) as
          | { ok: true; lead: CrmLead }
          | { ok: false; error: string }

        if (!response.ok || !payload.ok) {
          throw new Error(
            payload.ok ? "Unable to update process." : payload.error
          )
        }

        setLeads((current) =>
          current.map((lead) => (lead.id === leadId ? payload.lead : lead))
        )
        setSelectedLead((current) =>
          current?.id === leadId ? payload.lead : current
        )
      } catch (caughtError) {
        setLeads(previousLeads)
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update process."
        )
      } finally {
        setUpdatingId("")
      }
    },
    [leads]
  )

  const columns = useMemo<ColumnDef<CrmLead>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(Boolean(value))
            }
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortButton label="Created" column={column} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortButton label="Name" column={column} />,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelectedLead(row.original)}
            className="font-semibold transition hover:text-primary"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => <SortButton label="Email" column={column} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortButton label="Status" column={column} />,
        cell: ({ row }) => (
          <ProcessBadge process={row.original.status} />
        ),
        filterFn: (row, id, value) =>
          !value || row.getValue<string>(id) === value,
      },
      {
        accessorKey: "score",
        header: ({ column }) => <SortButton label="Score" column={column} />,
      },
      // {
      //   accessorKey: "company",
      //   header: ({ column }) => <SortButton label="Company" column={column} />,
      // },
      // {
      //   accessorKey: "industry",
      //   header: ({ column }) => <SortButton label="Industry" column={column} />,
      // },
      {
        accessorKey: "process",
        header: ({ column }) => <SortButton label="Process" column={column} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <select
              value={row.original.process}
              disabled={updatingId === row.original.id}
              onChange={(event) =>
                void updateProcess(row.original.id, event.target.value)
              }
              className="h-8 border bg-background px-2 text-xs transition outline-none focus:border-primary disabled:opacity-60"
            >
              {leadProcesses.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
          </div>
        ),
        filterFn: (row, id, value) =>
          !value || row.getValue<string>(id) === value,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <LeadActionButtons lead={row.original} onView={setSelectedLead} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [updateProcess, updatingId]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: leads,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid gap-4"
      >
        <div className="border bg-background">
          <div className="grid gap-3 border-b p-4 lg:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="Search name, email, company, industry..."
                className="pl-9"
              />
            </div>
            <select
              value={
                (table.getColumn("process")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn("process")
                  ?.setFilterValue(event.target.value || undefined)
              }
              className="h-10 border bg-background px-3 text-sm transition outline-none focus:border-primary"
            >
              <option value="">All processes</option>
              {leadProcesses.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
            <select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(event.target.value || undefined)
              }
              className="h-10 border bg-background px-3 text-sm transition outline-none focus:border-primary"
            >
              <option value="">All statuses</option>
              {(["Cold", "Warm", "Hot"] as const).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) =>
                table.setPageSize(Number(event.target.value))
              }
              className="h-10 border bg-background px-3 text-sm transition outline-none focus:border-primary"
            >
              {[10, 20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} / page
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="border-b bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Table className="min-w-315">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.id === "painPoint" && "max-w-80"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </p>
            <div className="flex items-center gap-2">
              <span>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {Math.max(table.getPageCount(), 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <IconChevronLeft />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <IconChevronRight />
              </Button>
            </div>
          </div>
        </div>

        <LeadDetailDialog
          lead={selectedLead}
          open={Boolean(selectedLead)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedLead(null)
            }
          }}
        />
      </motion.div>
    </TooltipProvider>
  )
}
