"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStudyData, DicomSeries, StudyData } from "./hooks/useStudyData";
import { initializeCornerstone } from "./lib/cornerstone-config";
import PatientInfo from "./components/PatientInfo";
import SeriesPanel from "./components/SeriesPanel";
import Toolbar from "./components/Toolbar";
import DicomViewer from "./components/DicomViewer";
import Spinner from "./components/Spinner";
import { ShareStudyModal } from "@/app/components/ShareStudyModal";

// Initialize Cornerstone once
initializeCornerstone();

const ViewerPage = () => {
  const router = useRouter();
  const { studyData, loading, error, studyInstanceUID } = useStudyData();
  const [activeTool, setActiveTool] = useState("Zoom");
  const [currentSeries, setCurrentSeries] = useState<DicomSeries | null>(null);
  const [resetViewport, setResetViewport] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (studyData && studyData.series.length > 0 && !currentSeries) {
      setCurrentSeries(studyData.series[0]);
    }
  }, [studyData, currentSeries]);

  const handleToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
  }, []);

  const handleReset = useCallback(() => {
    setResetViewport((c) => c + 1);
  }, []);

  const handleSeriesSelect = useCallback((series: DicomSeries) => {
    setCurrentSeries(series);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col text-white">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col text-white items-center justify-center">
        <h1 className="text-xl font-bold text-red-500">
          Error loading study: {error.message}
        </h1>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white flex flex-col">
      <header className="bg-slate-900/50 border-b border-white/10 p-4 shadow-md z-10">
        <div className="flex justify-between items-center max-w-[95rem] mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-cyan-200/80 hover:bg-white/10 rounded-md"
              title="Go back"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <Link
              href="/cases"
              className="p-2 text-cyan-200/80 hover:bg-white/10 rounded-md"
              title="Go to worklist"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">DICOM Viewer</h1>
          </div>
          <div className="flex items-center gap-4">
            {studyData && <PatientInfo patientInfo={studyData.patientInfo} />}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Share
            </button>
          </div>
        </div>
      </header>

      <ShareStudyModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        studyInstanceUID={studyInstanceUID as string}
      />

      <div className="flex flex-1 overflow-hidden">
        {studyData && (
          <SeriesPanel
            series={studyData.series}
            onSeriesSelect={handleSeriesSelect}
            currentSeriesUID={
              currentSeries ? currentSeries["0020000E"].Value[0] : null
            }
          />
        )}
        <DicomViewer
          series={currentSeries}
          studyInstanceUID={studyInstanceUID as string}
          activeTool={activeTool}
          onViewportReset={handleReset}
        />
        <Toolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default ViewerPage;
