export const extractPatientName = (
  patientNameObj: Record<string, unknown>,
): string => {
  if (!patientNameObj) return "Unknown";

  if (typeof patientNameObj === "string") {
    return patientNameObj;
  }

  if (typeof patientNameObj === "object") {
    if (patientNameObj.Alphabetic) {
      return String(patientNameObj.Alphabetic);
    }
    if (patientNameObj.Ideographic) {
      return String(patientNameObj.Ideographic);
    }
    if (patientNameObj.Phonetic) {
      return String(patientNameObj.Phonetic);
    }
    return JSON.stringify(patientNameObj);
  }

  return String(patientNameObj);
};

export const getDicomValue = (
  patientInfo: Record<string, any> | null,
  tag: string,
) => patientInfo?.[tag]?.Value?.[0];
