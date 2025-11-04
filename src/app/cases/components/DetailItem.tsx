"use client";

import React, { useState } from 'react';

interface DetailItemProps {
  label: string;
  value?: string;
  copyable?: boolean;
}

export function DetailItem({
  label,
  value,
  copyable = false,
}: DetailItemProps) {
  const displayValue = value || "Not Available";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
      } catch (err) {
        console.error("Failed to copy text:", err);
        // Optionally, show a temporary error message to the user
      }
    }
  };

  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 flex items-start justify-between">
        <span className="break-words flex-1" aria-label={`${label}: ${displayValue}`}>{displayValue}</span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0 relative group" // Added relative and group for tooltip
            title="Copy to clipboard"
            aria-live="polite" // Announce changes to screen readers
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-blue-600" // Change color on hover
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {isCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                Copied!
              </span>
            )}
          </button>
        )}
      </dd>
    </div>
  );
}
