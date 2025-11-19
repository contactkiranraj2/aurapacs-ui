// Regenerated StudiesPage with GitHub‑style UI, clean typography, subtle borders,
// neutral gray palette, rounded cards, and modern GitHub-like spacing.
// NOTE: Tailwind classes updated extensively. Replace old file with this.

"use client";

import { AppHeader } from "../components/AppHeader";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useStudies } from "./hooks/useStudies";
import { StudyRow } from "@/lib/types";
import { StatisticsCards } from "./components/StatisticsCards";
import { TableSkeleton } from "./components/TableSkeleton";
import { StatusBadge } from "./components/StatusBadge";
import { StudyDetailSidePanel } from "./components/StudyDetailSidePanel";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { OnboardUserModal } from "../components/OnboardUserModal";
import { ShareStudyListModal } from "../components/ShareStudyListModal";
import { supabase } from "@/lib/supabaseClient";

// Minimal GitHub-like dropdown
const FilterDropdown = ({ label, value, onChange, options }) => (
  <div className="flex items-center gap-2">
    <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="bg-white border border-gray-300 rounded-md px-2.5 py-1.5 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 transition"
    >
      <option value="all">All</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default function StudiesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const {
    studies,
    loading,
    uploading,
    handleUpload,
    filters = { modality: "all", status: "all" },
    setFilters,
    uniqueFilterOptions = { modalities: [], statuses: [] },
  } = useStudies();

  const [selectedStudy, setSelectedStudy] = useState<StudyRow | null>(null);
  const [studyToShare, setStudyToShare] = useState<StudyRow | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [statsRef, areStatsIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });
  const [tableRef, isTableIntersecting] = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) setUserRole(profile.role);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (studies.length > 0 && !selectedStudy) setSelectedStudy(studies[0]);
    if (studies.length === 0) setSelectedStudy(null);
  }, [studies, selectedStudy]);

  const handleViewDetails = (study: StudyRow) => {
    setSelectedStudy(study);
    setIsSidePanelOpen(true);
  };

  const handleShareClick = (study: StudyRow) => {
    setStudyToShare(study);
    setIsShareModalOpen(true);
  };

  const columns = useMemo<ColumnDef<StudyRow>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: () => (
          <span className="font-semibold text-gray-700">Patient</span>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.original.patientName}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.patientAge || "N/A"} ·{" "}
              {row.original.patientSex || "N/A"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "patientId",
        header: "Patient ID",
      },
      {
        accessorKey: "studyDate",
        header: "Study Date",
      },
      {
        accessorKey: "modality",
        header: "Modality",
      },
      {
        accessorKey: "numberOfInstances",
        header: "Instances",
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.numberOfInstances || 0}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />, // keep existing component
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link href={`/viewer/${row.original.studyInstanceUID}`}>
              <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
                View
              </button>
            </Link>
            <button
              onClick={() => handleShareClick(row.original)}
              className="px-3 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-900"
            >
              Share
            </button>
            <button
              onClick={() => handleViewDetails(row.original)}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: studies,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-[Inter]">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worklist</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and review DICOM studies and patient data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                placeholder="Search patients, studies..."
                className="outline-none text-sm w-full bg-transparent"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            {/* Upload */}
            <label className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              {uploading ? "Uploading..." : "Upload Study"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                multiple
              />
            </label>

            {/* Onboard */}
            {(userRole === "super-admin" || userRole === "hospital-admin") && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                {userRole === "super-admin"
                  ? "Onboard Hospital Admin"
                  : "Onboard Doctor"}
              </button>
            )}
          </div>
        </div>

        {/* Modals */}
        <OnboardUserModal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          role={userRole === "super-admin" ? "hospital-admin" : "doctor"}
        />

        <ShareStudyListModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          study={studyToShare}
        />

        {/* Stats */}
        <section
          ref={statsRef}
          className={`transition-all duration-700 ${
            areStatsIntersecting
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          <StatisticsCards data={studies} />
        </section>

        {/* Table + Side Panel */}
        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          <main
            ref={tableRef}
            className={`bg-white border border-gray-200 rounded-xl shadow-sm flex-1 transition-all duration-700 ${
              isTableIntersecting
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 flex gap-4 items-center">
              <FilterDropdown
                label="Modality"
                value={filters.modality}
                onChange={(e) =>
                  setFilters({ ...filters, modality: e.target.value })
                }
                options={uniqueFilterOptions.modalities}
              />
              <FilterDropdown
                label="Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                options={uniqueFilterOptions.statuses}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          className="px-4 py-3 text-left font-semibold text-gray-700"
                        >
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length}>
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                          selectedStudy?.id === row.original.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 text-gray-800">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex justify-between items-center text-sm text-gray-600">
              <div>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
                >
                  Prev
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </main>

          {/* Side Panel */}
          <aside>
            <StudyDetailSidePanel
              study={selectedStudy}
              isOpen={isSidePanelOpen}
              onClose={() => setIsSidePanelOpen(false)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
