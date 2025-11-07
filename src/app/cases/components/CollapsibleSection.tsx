// src/app/cases/components/CollapsibleSection.tsx
"use client";

export function CollapsibleSection({
  title,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-white/10 rounded-lg bg-white/5">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/10 rounded-t-lg transition-colors"
      >
        <span className="font-medium text-white text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-cyan-200/70 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}
