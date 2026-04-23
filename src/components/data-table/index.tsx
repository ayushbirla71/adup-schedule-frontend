"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { DataTablePagination } from "./components/data-table-pagination";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: filter[];
  maxHeight?: string; // ✅ New prop
  onPaginationChange?: (page: number, pageSize: number) => void; // ✅ New prop
  onRowSelectionChange?: (selectedRows: any) => void;
  onRowClick?: (row: TData) => void; // ✅ New prop for row click
  getRowCanSelect?: (row: TData) => boolean; // ✅ New prop for conditional selection
}
type filter = {
  label: string;
  value: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  onPaginationChange, // ✅ Destructure the callback
  maxHeight = "80vh", // ✅ Default maxHeight
  onRowSelectionChange,
  onRowClick, // ✅ Destructure the row click callback
  getRowCanSelect, // ✅ Destructure the conditional selection callback
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);
    onRowSelectionChange?.(selectedRows);
  }, [rowSelection]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: getRowCanSelect
      ? (row) => getRowCanSelect(row.original)
      : true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row  overflow-x-auto pb-4 flex-shrink-0">
        {filters?.map((filter) => (
          <div className="flex items-center " key={filter.value}>
            <Input
              placeholder={`Filter ${filter.label}...`}
              type={filter.value === "start_time" ? "date" : "text"}
              value={
                (table
                  .getColumn(`${filter.value}`)
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(`${filter.value}`)
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        ))}
      </div>

      {/* Table Container - flexible height when maxHeight is "none" */}
      <div
        className={`flex-1 w-full ${
          maxHeight !== "none" ? "rounded-md border" : ""
        } min-h-0`}
      >
        <div className="h-full overflow-auto overflow-y-auto">
          <Table className="text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className=""
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pt-4 flex-shrink-0 flex-row">
        <DataTablePagination
          table={table}
          onPaginationChange={onPaginationChange || (() => {})}
        />
      </div>
    </div>
  );
}
