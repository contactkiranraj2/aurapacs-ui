import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

export interface DicomInstance {
  "00080018": { Value: string[] };
  "00200013"?: { Value: string[] }; // Instance Number
  [key: string]: any;
}

export interface DicomSeries {
  "0020000E": { Value: string[] };
  instances: DicomInstance[];
  [key: string]: any;
}

export interface StudyData {
  patientInfo: Record<string, any> | null;
  series: DicomSeries[];
}

export const useStudyData = () => {
  const { id: studyInstanceUID } = useParams();
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudyData = useCallback(async () => {
    if (!studyInstanceUID) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch metadata
      const metaRes = await fetch(`/api/studies/${studyInstanceUID}/metadata`);
      if (!metaRes.ok) throw new Error("Failed to fetch metadata");
      const metaJson = await metaRes.json();

      // Fetch series list
      const seriesRes = await fetch(`/api/studies/${studyInstanceUID}`);
      if (!seriesRes.ok) throw new Error("Failed to fetch series");
      const seriesJson = await seriesRes.json();

      const seriesList: DicomSeries[] = seriesJson.series || [];

      // Fetch instances for each series
      const seriesWithInstances = await Promise.all(
        seriesList.map(async (series) => {
          const seriesInstanceUID = series["0020000E"].Value[0];
          const instancesRes = await fetch(
            `/api/studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances`,
          );
          if (!instancesRes.ok) {
            console.error(
              `Failed to fetch instances for series ${seriesInstanceUID}`,
            );
            return { ...series, instances: [] };
          }
          const instancesJson = await instancesRes.json();
          const instances: DicomInstance[] = instancesJson.instances || [];

          // Sort instances by Instance Number (0020,0013)
          instances.sort((a, b) => {
            const instanceNumberA = parseInt(a["00200013"]?.Value?.[0] || "0");
            const instanceNumberB = parseInt(b["00200013"]?.Value?.[0] || "0");
            return instanceNumberA - instanceNumberB;
          });

          return { ...series, instances };
        }),
      );

      setStudyData({
        patientInfo: metaJson.data,
        series: seriesWithInstances,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [studyInstanceUID]);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);

  return { studyData, loading, error, studyInstanceUID };
};
