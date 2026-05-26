"use client"

import { FormEvent, useCallback, useMemo, useState } from "react"
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
  IconEdit,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"

import { LeadActionButtons } from "@/components/crm/LeadActionButtons"
import { LeadDetailDialog } from "@/components/crm/LeadDetailDialog"
import { ProcessBadge } from "@/components/crm/ProcessBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

type EditableLead = Pick<
  CrmLead,
  | "name"
  | "email"
  | "company"
  | "industry"
  | "painPoint"
  | "budget"
  | "timeline"
  | "score"
  | "status"
  | "process"
  | "source"
>

const emptyEditableLead: EditableLead = {
  name: "",
  email: "",
  company: "",
  industry: "",
  painPoint: "",
  budget: "",
  timeline: "",
  score: 0,
  status: "Cold",
  process: "New",
  source: "CRM",
}

function toEditableLead(lead: CrmLead): EditableLead {
  return {
    name: lead.name,
    email: lead.email,
    company: lead.company,
    industry: lead.industry,
    painPoint: lead.painPoint,
    budget: lead.budget,
    timeline: lead.timeline,
    score: lead.score,
    status: lead.status,
    process: lead.process,
    source: lead.source,
  }
}

function LeadEditDialog({
  lead,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  lead: CrmLead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (leadId: string, values: EditableLead) => Promise<void>
  isSaving: boolean
}) {
  if (!lead) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LeadEditForm
        key={lead.id}
        lead={lead}
        onOpenChange={onOpenChange}
        onSave={onSave}
        isSaving={isSaving}
      />
    </Dialog>
  )
}

function LeadEditForm({
  lead,
  onOpenChange,
  onSave,
  isSaving,
}: {
  lead: CrmLead
  onOpenChange: (open: boolean) => void
  onSave: (leadId: string, values: EditableLead) => Promise<void>
  isSaving: boolean
}) {
  const [values, setValues] = useState<EditableLead>(() =>
    lead ? toEditableLead(lead) : emptyEditableLead
  )

  const updateValue = <Key extends keyof EditableLead>(
    key: Key,
    value: EditableLead[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!lead) {
      return
    }

    void onSave(lead.id, values)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit lead</DialogTitle>
        <DialogDescription>
          Update lead details and sync the change to Airtable.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit}>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["company", "Company"],
            ["industry", "Industry"],
            ["budget", "Budget"],
            ["timeline", "Timeline"],
            ["source", "Source"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                {label}
              </span>
              <Input
                value={String(values[key as keyof EditableLead])}
                onChange={(event) =>
                  updateValue(
                    key as keyof EditableLead,
                    event.target.value as never
                  )
                }
              />
            </label>
          ))}

          <label className="grid gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Score
            </span>
            <Input
              type="number"
              min={0}
              max={100}
              value={values.score}
              onChange={(event) =>
                updateValue("score", Number(event.target.value))
              }
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Status
            </span>
            <select
              value={values.status}
              onChange={(event) =>
                updateValue("status", event.target.value as CrmLead["status"])
              }
              className="h-10 border bg-background px-3 text-sm transition outline-none focus:border-primary"
            >
              {(["Cold", "Warm", "Hot"] as const).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Process
            </span>
            <select
              value={values.process}
              onChange={(event) =>
                updateValue("process", event.target.value as CrmLead["process"])
              }
              className="h-10 border bg-background px-3 text-sm transition outline-none focus:border-primary"
            >
              {leadProcesses.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Pain point
            </span>
            <textarea
              value={values.painPoint}
              onChange={(event) => updateValue("painPoint", event.target.value)}
              rows={5}
              className="min-h-30 resize-none border bg-background px-3 py-2 text-sm leading-6 transition outline-none focus:border-primary"
            />
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
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
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
        cell: ({ row }) => <ProcessBadge process={row.original.status} />,
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

  const selectedLeads = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)
  const selectedCount = selectedLeads.length

  const saveLead = async (leadId: string, values: EditableLead) => {
    setIsSavingEdit(true)
    setError("")

    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as
        | { ok: true; lead: CrmLead }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Unable to update lead." : payload.error)
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? payload.lead : lead))
      )
      setSelectedLead((current) =>
        current?.id === leadId ? payload.lead : current
      )
      setEditingLead(null)
      setRowSelection({})
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update lead."
      )
    } finally {
      setIsSavingEdit(false)
    }
  }

  const deleteLeads = async (ids: string[]) => {
    if (ids.length === 0) {
      return
    }

    const confirmed = window.confirm(
      ids.length === 1
        ? "Delete this lead?"
        : `Delete ${ids.length} selected leads?`
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      if (ids.length === 1) {
        const response = await fetch(`/api/crm/leads/${ids[0]}`, {
          method: "DELETE",
        })
        const payload = (await response.json()) as
          | { ok: true; id: string }
          | { ok: false; error: string }

        if (!response.ok || !payload.ok) {
          throw new Error(payload.ok ? "Unable to delete lead." : payload.error)
        }
      } else {
        const response = await fetch("/api/crm/leads/bulk-delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        })
        const payload = (await response.json()) as
          | { ok: true; ids: string[] }
          | { ok: false; error: string }

        if (!response.ok || !payload.ok) {
          throw new Error(
            payload.ok ? "Unable to delete leads." : payload.error
          )
        }
      }

      setLeads((current) => current.filter((lead) => !ids.includes(lead.id)))
      setSelectedLead((current) =>
        current && ids.includes(current.id) ? null : current
      )
      setEditingLead((current) =>
        current && ids.includes(current.id) ? null : current
      )
      setRowSelection({})
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete selected leads."
      )
    } finally {
      setIsDeleting(false)
    }
  }

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

          {selectedCount > 0 && (
            <div className="flex flex-col gap-3 border-b bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-start">
              <div className="flex flex-wrap gap-2">
                {selectedCount === 1 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLead(selectedLeads[0])}
                    >
                      <IconEdit data-icon="inline-start" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => void deleteLeads([selectedLeads[0].id])}
                    >
                      <IconTrash data-icon="inline-start" />
                      Delete
                    </Button>
                  </>
                )}
                {selectedCount > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() =>
                      void deleteLeads(selectedLeads.map((lead) => lead.id))
                    }
                  >
                    <IconTrash data-icon="inline-start" />
                    {isDeleting ? "Deleting..." : "Bulk delete"}
                  </Button>
                )}
              </div>
              <p className="font-semibold">{selectedCount} selected</p>
            </div>
          )}

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
        <LeadEditDialog
          lead={editingLead}
          open={Boolean(editingLead)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLead(null)
            }
          }}
          onSave={saveLead}
          isSaving={isSavingEdit}
        />
      </motion.div>
    </TooltipProvider>
  )
}
