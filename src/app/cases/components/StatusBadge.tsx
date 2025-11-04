import React from 'react';

interface StatusBadgeProps {
  status?: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-100 text-green-800", label: "Completed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case "processing":
        return { color: "bg-blue-100 text-blue-800", label: "Processing" };
      case "new": // Added 'new' status, assuming it might exist from StudyRow type
        return { color: "bg-blue-50 text-blue-800", label: "New" };
      case "approved":
        return { color: "bg-green-100 text-green-800", label: "Approved" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", label: "Rejected" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}
