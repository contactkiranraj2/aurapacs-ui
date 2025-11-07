import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import cornerstoneMath from "cornerstone-math";

export const initializeCornerstone = () => {
  // Initialize Cornerstone Tools
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.init();

  // Initialize WADO Image Loader
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
};
