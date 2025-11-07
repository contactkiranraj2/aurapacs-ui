// src/app/cases/components/TimelineEvent.tsx
"use client";

export function TimelineEvent({
  time,
  title,
  description,
  status,
}: {
  time?: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "processing";
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="flex items-start space-x-4 relative">
      <div className="absolute left-1.5 top-2 h-full w-px bg-white/10"></div>
      <div
        className={`relative z-10 w-3 h-3 rounded-full mt-1.5 ${getStatusColor(
          status,
        )}`}
      ></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white text-sm">{title}</span>
          {time && <span className="text-xs text-cyan-200/70">{time}</span>}
        </div>
        <p className="text-xs text-cyan-200/80 mt-1">{description}</p>
      </div>
    </div>
  );
}
