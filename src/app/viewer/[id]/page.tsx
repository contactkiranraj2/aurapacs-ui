"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import cornerstoneMath from "cornerstone-math";
import { ZoomIn, Move, Sun, RefreshCw } from "lucide-react";

// Initialize Cornerstone Tools
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

try {
  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    webWorkerPath: "/cornerstoneWADOImageLoaderWebWorker.js",
    taskConfiguration: {
      decodeTask: {
        codecsPath: "/cornerstoneWADOImageLoaderCodecs.js",
      },
    },
  });
} catch (error) {
  console.error("Failed to initialize cornerstone web worker manager:", error);
}

const extractPatientName = (
  patientNameObj: Record<string, unknown>,
): string => {
  if (!patientNameObj) return "Unknown";

  if (typeof patientNameObj === "string") {
    return patientNameObj;
  }

  if (typeof patientNameObj === "object") {
    if (patientNameObj.Alphabetic) {
      return patientNameObj.Alphabetic;
    }
    if (patientNameObj.Ideographic) {
      return patientNameObj.Ideographic;
    }
    if (patientNameObj.Phonetic) {
      return patientNameObj.Phonetic;
    }
    return JSON.stringify(patientNameObj);
  }

  return String(patientNameObj);
};

const DicomViewer = () => {
  const { id: studyInstanceUID } = useParams();
  const elementRef = useRef(null);
  const [activeTool, setActiveTool] = useState("");
  const [patientInfo, setPatientInfo] = useState<Record<string, any> | null>(
    null,
  );

  const setTool = useCallback(
    (toolName: string) => {
      if (activeTool) {
        cornerstoneTools.setToolDisabled(activeTool);
      }
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
      setActiveTool(toolName);
    },
    [activeTool],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    cornerstone.enable(element);

    const fetchAndLoadImage = async () => {
      if (studyInstanceUID) {
        try {
          const metaRes = await fetch(
            `/api/studies/${studyInstanceUID}/metadata`,
          );
          const metaJson = await metaRes.json();
          setPatientInfo(metaJson.data);

          const seriesRes = await fetch(`/api/studies/${studyInstanceUID}`);
          const seriesJson = await seriesRes.json();
          const firstSeries = seriesJson.series?.[0];

          if (firstSeries) {
            const seriesInstanceUID = firstSeries["0020000E"]?.Value[0];
            const instancesRes = await fetch(
              `/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances`,
            );
            const instancesJson = await instancesRes.json();
            const firstInstance = instancesJson.instances?.[0];

            if (firstInstance) {
              const sopInstanceUID = firstInstance["00080018"]?.Value[0];
              const imageId = `wadouri:/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`;

              cornerstone.loadImage(imageId).then((image) => {
                cornerstone.displayImage(element, image);
                cornerstoneTools.addStackStateManager(element, ["stack"]);
                cornerstoneTools.addToolState(element, "stack", {
                  imageIds: [imageId],
                  currentImageIdIndex: 0,
                });

                // Set up tools
                cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
                  configuration: { invert: true },
                });
                cornerstoneTools.addTool(cornerstoneTools.PanTool);
                cornerstoneTools.addTool(cornerstoneTools.WwwcTool);

                // Activate a default tool
                setTool("Zoom");
              });
            }
          }
        } catch (error) {
          console.error("Error fetching or loading DICOM data:", error);
        }
      }
    };

    fetchAndLoadImage();

    return () => {
      if (element) {
        cornerstone.disable(element);
      }
    };
  }, [studyInstanceUID, setTool]);

  const resetViewport = () => {
    cornerstone.reset(elementRef.current!);
  };

  const getDicomValue = (tag: string) => patientInfo?.[tag]?.Value?.[0];

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col text-white">
      <header className="bg-gray-800 p-4 shadow-md z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">DICOM Viewer</h1>
          {patientInfo && (
            <div className="text-sm text-right">
              <p>
                <strong>Patient:</strong>{" "}
                {extractPatientName(getDicomValue("00100010"))}
              </p>
              <p>
                <strong>Study:</strong> {getDicomValue("00081030") || "N/A"}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="bg-gray-800 w-20 flex flex-col items-center py-4">
          <button
            onClick={() => setTool("Zoom")}
            className={`p-3 rounded ${activeTool === "Zoom" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            title="Zoom"
          >
            <ZoomIn />
          </button>
          <button
            onClick={() => setTool("Pan")}
            className={`p-3 mt-2 rounded ${activeTool === "Pan" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            title="Pan"
          >
            <Move />
          </button>
          <button
            onClick={() => setTool("Wwwc")}
            className={`p-3 mt-2 rounded ${activeTool === "Wwwc" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            title="Window/Level"
          >
            <Sun />
          </button>
          <button
            onClick={resetViewport}
            className="p-3 mt-2 rounded hover:bg-gray-700"
            title="Reset"
          >
            <RefreshCw />
          </button>
        </nav>

        <main className="flex-1 bg-black flex items-center justify-center p-4">
          <div ref={elementRef} className="w-full h-full"></div>
        </main>
      </div>
    </div>
  );
};

export default DicomViewer;
