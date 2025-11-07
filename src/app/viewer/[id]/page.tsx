"use client";

import { useEffect, useState, useCallback } from "react";
import { useStudyData, DicomSeries, StudyData } from "./hooks/useStudyData";
import { initializeCornerstone } from "./lib/cornerstone-config";
import PatientInfo from "./components/PatientInfo";
import SeriesPanel from "./components/SeriesPanel";
import Toolbar from "./components/Toolbar";
import DicomViewer from "./components/DicomViewer";
import Spinner from "./components/Spinner";

// Initialize Cornerstone once
initializeCornerstone();

const ViewerPage = () => {
  const { studyData, loading, error, studyInstanceUID } = useStudyData();
  const [activeTool, setActiveTool] = useState("Zoom");
  const [currentSeries, setCurrentSeries] = useState<DicomSeries | null>(null);
  const [resetViewport, setResetViewport] = useState(0);

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
          <h1 className="text-2xl font-bold text-white">DICOM Viewer</h1>
          {studyData && <PatientInfo patientInfo={studyData.patientInfo} />}
        </div>
      </header>

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
