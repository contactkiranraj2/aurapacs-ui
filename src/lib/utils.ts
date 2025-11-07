import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RawDicomAttribute } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractPatientName = (
  patientNameObj: RawDicomAttribute,
): string => {
  if (!patientNameObj || !patientNameObj.Value || !patientNameObj.Value.length)
    return "Unknown";

  const nameData = patientNameObj.Value[0];

  if (typeof nameData === "string") {
    return nameData.replace(/\^/g, " ").trim();
  }

  if (typeof nameData === "object" && nameData !== null) {
    if ("Alphabetic" in nameData && typeof nameData.Alphabetic === "string") {
      return nameData.Alphabetic.replace(/\^/g, " ").trim();
    }
    // Add fallbacks for other representations if necessary
    return "Unknown";
  }

  return "Unknown";
};
