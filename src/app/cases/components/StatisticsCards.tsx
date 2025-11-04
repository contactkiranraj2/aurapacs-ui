import React, { useMemo } from "react";
import { StudyRow } from "@/lib/types"; // Import StudyRow from centralized types

interface StatisticsCardsProps {
  data: StudyRow[];
}

export function StatisticsCards({ data }: StatisticsCardsProps) {
  const stats = useMemo(() => {
    const totalStudies = data.length;
    const modalities = data.reduce(
      (acc, study) => {
        const modality = study.modality || "Unknown";
        acc[modality] = (acc[modality] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get today's date in YYYYMMDD format for comparison
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const todayStudies = data.filter(
      (study) => study.studyDate === today,
    ).length;

    const uniquePatients = new Set(data.map((study) => study.patientId)).size;

    return {
      totalStudies,
      modalities,
      todayStudies,
      uniquePatients,
      topModality:
        Object.entries(modalities).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "None",
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Studies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalStudies}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unique Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.uniquePatients}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Studies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.todayStudies}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-600"
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Modality</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.topModality}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <svg
              className="w-6 h-6 text-orange-600"
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
          </div>
        </div>
      </div>
    </div>
  );
}
