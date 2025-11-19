"use client";
import { useState, useEffect, useCallback } from "react";
import { StudyRow } from "@/lib/types";

// In-memory cache
let cachedStudies: StudyRow[] | null = null;

interface UseStudiesResult {
  studies: StudyRow[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchStudies: (force?: boolean) => Promise<void>;
  handleUpload: (files: FileList | null) => Promise<void>;
  filters?: { modality: string; status: string };
  setFilters?: (filters: { modality: string; status: string }) => void;
  uniqueFilterOptions?: { modalities: string[]; statuses: string[] };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function useStudies(): UseStudiesResult {
  const [studies, setStudies] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(!cachedStudies); // Only set initial loading if no cache
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudies = useCallback(
    async (force = false) => {
      if (cachedStudies && !force) {
        setStudies(cachedStudies);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/studies`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            errData.error || `Failed to fetch studies: ${res.status}`,
          );
        }
        const json = await res.json();
        const dbStudies = Array.isArray(json?.data) ? json.data : [];
        
        // Map database format to StudyRow format
        const parsedStudies: StudyRow[] = dbStudies.map((study: any) => ({
          id: study.id || study.study_instance_uid,
          studyId: study.study_instance_uid || "N/A",
          patientId: study.patient_id || "N/A",
          patientName: study.patient_name || "Unknown",
          studyDate: study.study_date || "N/A",
          modality: study.modality || "N/A",
          description: study.study_description || "N/A",
          status: study.status?.toLowerCase() || "new",
          dicomFileCount: study.instance_count || study.number_of_instances || 0,
          uploadedAt: study.created_at || new Date().toISOString(),
          tenantId: "placeholder-tenant-id",
          userId: study.user_id || "placeholder-user-id",
          createdAt: study.created_at || new Date().toISOString(),
          updatedAt: study.updated_at || new Date().toISOString(),
          patientBirthDate: study.patient_birth_date,
          patientSex: study.patient_sex,
          patientAge: study.patient_age,
          referringPhysician: study.referring_physician,
          physicianOfRecord: study.physician_of_record,
          readingPhysician: study.reading_physician,
          studyTime: study.study_time,
          accessionNumber: study.accession_number,
          studyInstanceUID: study.study_instance_uid,
          institutionName: study.institution_name,
          stationName: study.station_name,
          numberOfSeries: study.number_of_series,
          numberOfInstances: study.instance_count || study.number_of_instances || 0,
          reportId: study.report_id || null,
        }));

        cachedStudies = parsedStudies;
        setStudies(parsedStudies);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching studies:", error);
        setError(error.message || "Failed to load studies. Please try again.");
        setStudies([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Explicitly check for the success message before reloading
      if (result.message) {
        console.log("Upload successful. Refetching studies...");
        await fetchStudies(true); // Force refetch
      } else {
        throw new Error(
          "Upload succeeded but the server response was unexpected.",
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

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
