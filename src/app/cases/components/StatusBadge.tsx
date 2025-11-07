// src/app/cases/components/StatusBadge.tsx
"use client";

import { StudyRow } from "@/lib/types";

export function StatusBadge({ status }: { status?: StudyRow["status"] }) {
  const getStatusConfig = (status?: StudyRow["status"]) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-500/10 text-green-400",
          dot: "bg-green-500",
          label: "Completed",
        };
      case "approved":
        return {
          color: "bg-sky-500/10 text-sky-400",
          dot: "bg-sky-500",
          label: "Approved",
        };
      case "pending":
        return {
          color: "bg-yellow-500/10 text-yellow-400",
          dot: "bg-yellow-500",
          label: "Pending",
        };
      case "processing":
        return {
          color: "bg-blue-500/10 text-blue-400",
          dot: "bg-blue-500",
          label: "Processing",
        };
      case "rejected":
        return {
          color: "bg-red-500/10 text-red-400",
          dot: "bg-red-500",
          label: "Rejected",
        };
      case "new":
        return {
          color: "bg-indigo-500/10 text-indigo-400",
          dot: "bg-indigo-500",
          label: "New",
        };
      default:
        return {
          color: "bg-slate-500/10 text-slate-400",
          dot: "bg-slate-500",
          label: "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}></span>
      {config.label}
    </span>
  );
}
