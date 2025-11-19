// src/app/cases/components/StatisticsCards.tsx
"use client";
import { useMemo } from "react";
import { StudyRow } from "@/lib/types";

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-black-200">{title}</p>
        <p className="text-2xl font-bold text-teal-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-500/10 rounded-lg`}>{icon}</div>
    </div>
  </div>
);

export function StatisticsCards({ data }: { data: StudyRow[] }) {
  const stats = useMemo(() => {
    const totalStudies = data.length;
    const modalities = data.reduce((acc, study) => {
      const modality = study.modality || "Unknown";
      acc[modality] = (acc[modality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStudies = data.filter((study) => {
      const studyDate = new Date(study.studyDate); // Assuming studyDate is in a format Date can parse
      return studyDate >= today;
    }).length;

    const uniquePatients = new Set(data.map((study) => study.patientId)).size;

    return {
      totalStudies,
      uniquePatients,
      todayStudies,
      topModality:
        Object.entries(modalities).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "None",
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Studies"
        value={stats.totalStudies}
        color="black"
        icon={
          <svg
            className="w-6 h-6 text-teal-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />
      <StatCard
        title="Unique Patients"
        value={stats.uniquePatients}
        color="green"
        icon={
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
      <StatCard
        title="Today's Studies"
        value={stats.todayStudies}
        color="purple"
        icon={
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
      />
      <StatCard
        title="Top Modality"
        value={stats.topModality}
        color="cyan"
        icon={
          <svg
            className="w-6 h-6 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
      />
    </div>
  );
}
