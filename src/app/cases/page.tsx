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

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) => (
  <div className="flex items-center gap-2">
    <label className="text-sm text-cyan-200/80 whitespace-nowrap">
      {label}:
    </label>
    <select
      value={value}
      onChange={onChange}
      className="bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
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
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

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
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (studies.length > 0 && !selectedStudy) {
      setSelectedStudy(studies[0]);
    } else if (studies.length === 0) {
      setSelectedStudy(null);
    }
  }, [studies, selectedStudy]);

  const handleViewDetails = (study: StudyRow) => {
    setSelectedStudy(study);
    setIsSidePanelOpen(true);
  };

  const handleShareClick = (study: StudyRow) => {
    setStudyToShare(study);
    setIsShareModalOpen(true);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    await handleUpload(file);
    e.target.value = "";
  };

  const columns = useMemo<ColumnDef<StudyRow>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: "Patient",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-white">
              {row.original.patientName}
            </div>
            <div className="text-xs text-cyan-200/70">
              {row.original.patientAge || "N/A"} •{" "}
              {row.original.patientSex || "N/A"}
            </div>
          </div>
        ),
      },
      { accessorKey: "patientId", header: "Patient ID" },
      { accessorKey: "studyDate", header: "Study Date" },
      { accessorKey: "modality", header: "Modality" },
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
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end items-center gap-2">
            <Link href={`/viewer/${row.original.studyInstanceUID}`}>
              <button className="px-3 py-1.5 text-sm rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-sm">
                View
              </button>
            </Link>
            <button
              onClick={() => handleShareClick(row.original)}
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
            >
              Share
            </button>
            <button
              onClick={() => handleViewDetails(row.original)}
              className="p-2 text-cyan-200/80 hover:bg-white/10 rounded-md"
              title="View Details"
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
                ></path>
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <AppHeader />
      <div className="mx-auto w-full max-w-[95rem] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Worklist</h1>
            <p className="text-sm text-cyan-200/80 mt-1">
              Manage and review DICOM studies and patient data.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 shadow-sm flex-1 focus-within:ring-2 focus-within:ring-cyan-400 transition-all">
              <svg
                className="w-4 h-4 text-cyan-200/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
                className="outline-none text-sm w-full bg-transparent placeholder-cyan-200/50"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <label className="inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 cursor-pointer shadow-sm transition-all hover:shadow-md disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload Study"}
              <input
                type="file"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
                multiple
                webkitdirectory=""
              />
            </label>
            {userRole === "super-admin" && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Onboard Hospital Admin
              </button>
            )}
            {userRole === "hospital-admin" && (
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Onboard Doctor
              </button>
            )}
          </div>
        </div>

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

        <section
          ref={statsRef as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-700 delay-200 ${
            areStatsIntersecting
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          <StatisticsCards data={studies} />
        </section>

        <div className="flex flex-col lg:flex-row gap-6">
          <main
            ref={tableRef as React.RefObject<HTMLDivElement>}
            className={`bg-white/5 border border-white/10 rounded-2xl shadow-lg flex-1 transition-all duration-700 delay-300 ${
              isTableIntersecting
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
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
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-white/10">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          className="px-6 py-3 text-left text-xs font-semibold text-cyan-200/80 uppercase tracking-wider"
                        >
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext(),
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
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                          selectedStudy?.id === row.original.id
                            ? "bg-cyan-500/10"
                            : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-3 text-sm text-cyan-100/90"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 text-sm text-cyan-200/70">
              <div>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 border border-white/20 rounded-md disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 border border-white/20 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </main>
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
