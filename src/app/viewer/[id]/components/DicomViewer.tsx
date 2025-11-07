"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import { DicomSeries } from "../hooks/useStudyData";
import Spinner from "./Spinner";

interface DicomViewerProps {
  series: DicomSeries | null;
  studyInstanceUID: string;
  activeTool: string;
  onViewportReset: () => void;
}

const DicomViewer = ({
  series,
  studyInstanceUID,
  activeTool,
  onViewportReset,
}: DicomViewerProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const isInitialLoadForSeries = useRef(true);
  const [stackState, setStackState] = useState({
    currentImageIdIndex: 0,
    imageIds: [] as string[],
  });
  const [isSeriesLoading, setIsSeriesLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const setTool = useCallback((toolName: string) => {
    if (isInitialized.current) {
      // Set the primary tool (e.g., Zoom, Pan) to be active on left-click.
      cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
      // Ensure the scroll wheel is always active for scrolling through the stack.
      cornerstoneTools.setToolActive("StackScrollMouseWheel", {});
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!isInitialized.current) {
      cornerstone.enable(element);
      isInitialized.current = true;
    }

    const onNewImage = () => {
      try {
        const newStackState = cornerstoneTools.getToolState(element, "stack");
        if (newStackState?.data?.[0]) {
          setStackState(newStackState.data[0]);
        }
        if (isInitialLoadForSeries.current) {
          // Use a timeout to ensure the viewport is ready before fitting the image.
          setTimeout(() => cornerstone.fitToWindow(element), 0);
          isInitialLoadForSeries.current = false;
        }
      } catch (error) {
        console.warn("Could not get stack state:", error);
      }
    };

    const onImageLoadStart = () => setIsImageLoading(true);
    const onImageLoadEnd = () => setIsImageLoading(false);

    const handleResize = () => {
      if (isInitialized.current && cornerstone.getImage(element)) {
        cornerstone.resize(element, true);
        cornerstone.fitToWindow(element);
      }
    };

    element.addEventListener("cornerstonenewimage", onNewImage);
    element.addEventListener("cornerstoneimageloadstart", onImageLoadStart);
    element.addEventListener("cornerstoneimageloadend", onImageLoadEnd);
    element.addEventListener("cornerstoneimageloaderror", onImageLoadEnd);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      element.removeEventListener("cornerstonenewimage", onNewImage);
      element.removeEventListener(
        "cornerstoneimageloadstart",
        onImageLoadStart,
      );
      element.removeEventListener("cornerstoneimageloadend", onImageLoadEnd);
      element.removeEventListener("cornerstoneimageloaderror", onImageLoadEnd);
      if (element && isInitialized.current) {
        try {
          cornerstone.disable(element);
        } catch (error) {
          console.warn("Cornerstone disable failed:", error);
        }
        isInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!series || !studyInstanceUID || !isInitialized.current) return;

    isInitialLoadForSeries.current = true;
    setIsSeriesLoading(true);
    const element = elementRef.current!;
    const seriesInstanceUID = series["0020000E"].Value[0];

    const imageIds = series.instances.map((instance) => {
      const sopInstanceUID = instance["00080018"].Value[0];
      return `wadouri:/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`;
    });

    if (imageIds.length > 0) {
      setStackState({ currentImageIdIndex: 0, imageIds });
      cornerstone.loadImage(imageIds[0]).then((image) => {
        cornerstone.displayImage(element, image);
        setIsSeriesLoading(false);
        cornerstoneTools.addStackStateManager(element, ["stack"]);
        cornerstoneTools.addToolState(element, "stack", {
          imageIds,
          currentImageIdIndex: 0,
        });

        try {
          cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
            configuration: { invert: true },
          });
          cornerstoneTools.addTool(cornerstoneTools.PanTool);
          cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
          cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
        } catch (error) {
          // Tools might already be added
        }

        setTool(activeTool); // This now correctly activates both the primary tool and scroll
        cornerstoneTools.stackPrefetch.enable(element);
        cornerstoneTools.stackPrefetch.setConfiguration({
          maxImagesToPrefetch: Infinity,
          preserveExistingPool: false,
          preFetchConnections: 6,
        });
      });
    } else {
      setStackState({ currentImageIdIndex: 0, imageIds: [] });
      cornerstone.reset(element);
      setIsSeriesLoading(false);
    }
  }, [series, studyInstanceUID, activeTool, setTool]);

  useEffect(() => {
    setTool(activeTool);
  }, [activeTool, setTool]);

  useEffect(() => {
    const element = elementRef.current;
    if (isInitialized.current && element) {
      cornerstone.reset(element);
      if (cornerstone.getImage(element)) {
        cornerstone.fitToWindow(element);
      }
    }
  }, [onViewportReset]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    const element = elementRef.current;
    if (!isNaN(newIndex) && element) {
      const stackData = cornerstoneTools.getToolState(element, "stack")
        ?.data?.[0];
      if (stackData && stackData.imageIds && stackData.imageIds[newIndex]) {
        const imageId = stackData.imageIds[newIndex];
        cornerstone.loadImage(imageId).then((image) => {
          const viewport = cornerstone.getViewport(element);
          cornerstone.displayImage(element, image, viewport);
        });
      }
    }
  };

  return (
    <main className="flex-1 bg-black flex flex-col items-center justify-center p-4 relative">
      {isSeriesLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          <span>Loading series...</span>
        </div>
      )}
      {isImageLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      {!series && !isSeriesLoading && <Spinner />}
      <div ref={elementRef} className="min-w-full min-h-full flex-1"></div>
      {series && stackState.imageIds.length > 1 && (
        <div className="absolute bottom-4 right-4 left-4 flex items-center gap-4 px-4">
          <input
            type="range"
            min="0"
            max={stackState.imageIds.length - 1}
            value={stackState.currentImageIdIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap">
            {stackState.currentImageIdIndex + 1} / {stackState.imageIds.length}
          </div>
        </div>
      )}
    </main>
  );
};

export default DicomViewer;
