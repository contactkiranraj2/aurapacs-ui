import React from 'react';

export type TimelineStatus = "completed" | "pending" | "processing" | "new" | "approved" | "rejected";

interface TimelineEventProps {
  time?: string;
  title: string;
  description: string;
  status: TimelineStatus;
}

export function TimelineEvent({
  time,
  title,
  description,
  status,
}: TimelineEventProps) {
  const getStatusColor = (currentStatus: TimelineStatus) => {
    switch (currentStatus) {
      case "completed":
      case "approved":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
      case "new":
        return "bg-yellow-500"; // Changed to yellow for pending/new for better distinction
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div
        className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(status)}`}
        role="presentation" // Indicate it's for visual styling, not interactive
        aria-label={`Status: ${status}`}
      ></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 text-sm">{title}</span>
          {time && <time className="text-xs text-gray-500">{time}</time>}
        </div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
