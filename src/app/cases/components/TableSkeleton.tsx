// src/app/cases/components/TableSkeleton.tsx
"use client";

export function TableSkeleton() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-700 rounded col-span-1"></div>
              <div className="h-4 bg-slate-700 rounded col-span-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
