export type StudyRow = {
  id: string;
  studyId: string;
  patientId: string;
  patientName: string;
  patientBirthDate?: string;
  patientSex?: string;
  patientAge?: string; // Derived or explicitly stored
  studyDate: string;
  studyTime?: string;
  accessionNumber?: string;
  modality: string;
  description: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "new"
    | "completed"
    | "processing"; // Extended statuses
  physician?: string; // Referring physician, Physician of Record, Reading Physician might be separate fields
  referringPhysician?: string;
  physicianOfRecord?: string;
  readingPhysician?: string;
  reportId: string | null;
  dicomFileCount?: number; // Optional, might be derived
  uploadedAt: string;
  tenantId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  studyInstanceUID?: string; // Technical detail
  institutionName?: string;
  stationName?: string;
  numberOfSeries?: number;
  numberOfInstances?: number;
};

// Represents the structure of a DICOM tag value.
// DICOM values often come in an array, and can be strings, numbers, or objects (e.g., for PatientName).
type DicomTagValue = string | number | object;

// Represents a single DICOM attribute (e.g., "00100010" for PatientName).
// The 'Value' property is an array containing the actual data.
interface DicomTag {
  Value?: DicomTagValue[];
  // Other potential properties like 'vr' (Value Representation) could be added if needed
  // vr?: string;
}

// Represents a raw DICOM object as a record of DICOM tags.
// Each key is a DICOM tag (e.g., "00100010"), and its value is a DicomTag object.
export type RawDicom = Record<string, DicomTag>;
