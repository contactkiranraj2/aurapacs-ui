"use client";

import { useState, useEffect, useCallback } from "react";
import { StudyRow, RawDicom, RawDicomAttribute } from "@/lib/types";
import { extractPatientName } from "@/lib/utils";

interface UseStudiesResult {
  studies: StudyRow[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchStudies: () => Promise<void>;
  handleUpload: (file: File) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function useStudies(): UseStudiesResult {
  const [studies, setStudies] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDicomValue = useCallback((s: RawDicom, tag: string): string | undefined => {
    const value = s[tag]?.Value?.[0];
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return value?.toString(); // Ensure it's a string
  }, []);

  const parseRawDicomToStudyRow = useCallback((raw: RawDicom, index: number): StudyRow => {
    const patientNameObj = raw["00100010"] as RawDicomAttribute;
    const patientName = extractPatientName(patientNameObj);

    const studyInstanceUID = getDicomValue(raw, "0020000D") ?? `study-${index}-${Date.now()}`;

    // Random status for demo purposes, in a real app this would come from the backend
    const statuses: StudyRow["status"][] = ["completed", "pending", "processing", "approved", "rejected", "new"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: studyInstanceUID,
      studyId: getDicomValue(raw, "00200010") ?? "N/A",
      patientId: getDicomValue(raw, "00100020") ?? "N/A",
      patientName,
      studyDate: getDicomValue(raw, "00080020") ?? "N/A",
      modality: getDicomValue(raw, "00080060") ?? "N/A",
      description:
        getDicomValue(raw, "00081030") ?? getDicomValue(raw, "0008103E") ?? "N/A",
      status: randomStatus, // Ensure status is one of the defined types
      dicomFileCount: parseInt(getDicomValue(raw, "00201208") || "0"), // Assuming instances count is dicom file count
      uploadedAt: new Date().toISOString(), // Placeholder
      tenantId: "placeholder-tenant-id", // Placeholder
      userId: "placeholder-user-id", // Placeholder
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder

      // Additional fields from DICOM
      patientBirthDate: getDicomValue(raw, "00100030"),
      patientSex: getDicomValue(raw, "00100040"),
      patientAge: getDicomValue(raw, "00101010"),
      referringPhysician: getDicomValue(raw, "00080090"),
      physicianOfRecord: getDicomValue(raw, "00081048"),
      readingPhysician: getDicomValue(raw, "00081060"),
      studyTime: getDicomValue(raw, "00080030"),
      accessionNumber: getDicomValue(raw, "00080050"),
      studyInstanceUID: getDicomValue(raw, "0020000D"),
      institutionName: getDicomValue(raw, "00080080"),
      stationName: getDicomValue(raw, "00081010"),
      numberOfSeries: parseInt(getDicomValue(raw, "00201206") || "0"),
      numberOfInstances: parseInt(getDicomValue(raw, "00201208") || "0"),
      reportId: null, // Default to null
    };
  }, [getDicomValue]);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/studies`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Failed to fetch studies: ${res.status}`);
      }
      const json = await res.json();

      const rawStudies: RawDicom[] = Array.isArray(json?.data) ? json.data : [];
      const parsedStudies: StudyRow[] = rawStudies.map(parseRawDicomToStudyRow);

      setStudies(parsedStudies);
    } catch (err: any) {
      console.error("Error fetching studies:", err);
      setError(err.message || "Failed to load studies. Please try again.");
      setStudies([]);
    } finally {
      setLoading(false);
    }
  }, [parseRawDicomToStudyRow]);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed.");
      }
      // Re-fetch studies to update the list after successful upload
      await fetchStudies();
      // Optional: show a success message
      // alert("Upload successful!");
    } catch (err: any) {
      console.error("Error uploading study:", err);
      setError(err.message || "Failed to upload study. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [fetchStudies]);

  // Fetch studies on component mount
  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  return {
    studies,
    loading,
    uploading,
    error,
    fetchStudies,
    handleUpload,
  };
}
