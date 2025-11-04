import React from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  id: string; // Add an ID for accessibility
}

export function CollapsibleSection({
  title,
  children,
  isExpanded,
  onToggle,
  id,
}: CollapsibleSectionProps) {
  const contentId = `${id}-content`;
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        id={id}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${
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
        <div id={contentId} role="region" aria-labelledby={id} className="px-4 py-3 space-y-3 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}
