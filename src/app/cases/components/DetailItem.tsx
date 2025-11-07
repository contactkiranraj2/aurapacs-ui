// src/app/cases/components/DetailItem.tsx
"use client";
import { useState } from "react";

export function DetailItem({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const displayValue = value || "N/A";

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-cyan-200/70 mb-1">{label}</dt>
      <dd className="text-sm text-white flex items-start justify-between">
        <span className="break-words flex-1">{displayValue}</span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-cyan-200/70"
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
            )}
          </button>
        )}
      </dd>
    </div>
  );
}
