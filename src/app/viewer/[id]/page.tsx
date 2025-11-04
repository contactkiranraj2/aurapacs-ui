"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// It's important to configure the web worker manager before using it.
// The paths might need adjustment based on your project's public folder structure.
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

const DicomViewer = () => {
  const { id: studyInstanceUID } = useParams();
  const elementRef = useRef(null);

  useEffect(() => {
    const fetchAndLoadImage = async () => {
      if (studyInstanceUID && elementRef.current) {
        const element = elementRef.current;
        cornerstone.enable(element);

        try {
          const res = await fetch(`/api/studies/${studyInstanceUID}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch study details: ${res.status}`);
          }
          const studyData = await res.json();

          const seriesList = studyData.series;
          const firstSeries = seriesList?.[0];

          if (firstSeries) {
            const seriesInstanceUID = firstSeries["0020000E"]?.Value[0];

            const instancesRes = await fetch(
              `/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances`,
            );
            if (!instancesRes.ok) {
              throw new Error(
                `Failed to fetch instances: ${instancesRes.status}`,
              );
            }
            const instancesData = await instancesRes.json();
            const firstInstance = instancesData.instances?.[0];

            if (firstInstance) {
              const sopInstanceUID = firstInstance["00080018"]?.Value[0];
              const imageId = `wadouri:/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`;

              cornerstone
                .loadImage(imageId)
                .then((image) => {
                  cornerstone.displayImage(element, image);
                })
                .catch((err) => {
                  console.error("Cornerstone loadImage error:", err);
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
      if (elementRef.current) {
        try {
          cornerstone.disable(elementRef.current);
        } catch (error) {
          // It might throw an error if the element is already disabled, which is fine.
        }
      }
    };
  }, [studyInstanceUID]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl mb-4">DICOM Viewer</h1>
      <p className="mb-4">Study Instance UID: {studyInstanceUID as string}</p>
      <div
        ref={elementRef}
        className="w-[512px] h-[512px] border border-gray-500"
      ></div>
    </div>
  );
};

export default DicomViewer;
