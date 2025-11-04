import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async () => {
  try {
    if (!process.env.GCP_KEYFILE_JSON) {
      throw new Error("Missing GCP_KEYFILE_JSON env variable");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GCP_KEYFILE_JSON),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });

    const parent = `projects/ferrous-osprey-473710-t6/locations/asia-south1/datasets/Aurapacs-dataset/dicomStores/aurapacs-data-store`;

    // Step 1: Search for all studies
    const studiesResponse =
      await healthcare.projects.locations.datasets.dicomStores.searchForStudies(
        {
          parent,
          dicomWebPath: "studies",
        },
        {
          headers: { Accept: "application/dicom+json" },
          responseType: "json",
        },
      );

    const studies = studiesResponse.data;

    // If no studies found, return empty array
    if (!studies || !Array.isArray(studies) || studies.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Step 2: Fetch complete metadata for each study
    const studyDetails = await Promise.all(
      studies.map(async (study: Record<string, any>) => {
        try {
          const studyInstanceUID = study["0020000D"]?.["Value"]?.[0];

          if (!studyInstanceUID) {
            console.warn("Study missing StudyInstanceUID:", study);
            return null;
          }

          // Fetch complete study metadata
          const metadataResponse =
            await healthcare.projects.locations.datasets.dicomStores.studies.retrieveMetadata(
              {
                parent,
                dicomWebPath: `studies/${studyInstanceUID}/metadata`,
              },
              {
                headers: { Accept: "application/dicom+json" },
                responseType: "json",
              },
            );

          const metadata: Record<string, any>[] =
            metadataResponse.data as Record<string, any>[];

          // The metadata returns an array of instances, we take the first one to get study-level info
          if (Array.isArray(metadata) && metadata.length > 0) {
            const firstInstance: Record<string, any> = metadata[0];

            // Extract all required DICOM tags from the complete metadata
            return {
              "00080005": firstInstance["00080005"], // SpecificCharacterSet
              "00080020": firstInstance["00080020"], // StudyDate
              "00080030": firstInstance["00080030"], // StudyTime
              "00080050": firstInstance["00080050"], // AccessionNumber
              "00080060": firstInstance["00080060"], // Modality
              "00080090": firstInstance["00080090"], // ReferringPhysicianName
              "00081030": firstInstance["00081030"], // StudyDescription
              "0008103E": firstInstance["0008103E"], // SeriesDescription
              "00081048": firstInstance["00081048"], // PhysicianOfRecord
              "00081060": firstInstance["00081060"], // NameOfPhysicianReadingStudy
              "00081190": firstInstance["00081190"], // URL
              "00100010": firstInstance["00100010"], // PatientName
              "00100020": firstInstance["00100020"], // PatientID
              "00100030": firstInstance["00100030"], // PatientBirthDate
              "00100040": firstInstance["00100040"], // PatientSex
              "00101001": firstInstance["00101001"], // OtherPatientNames
              "00101005": firstInstance["00101005"], // PatientBirthName
              "00101010": firstInstance["00101010"], // PatientAge
              "00101020": firstInstance["00101020"], // PatientSize
              "00101030": firstInstance["00101030"], // PatientWeight
              "00102160": firstInstance["00102160"], // EthnicGroup
              "0020000D": firstInstance["0020000D"], // StudyInstanceUID
              "00200010": firstInstance["00200010"], // StudyID
              "00201206": firstInstance["00201206"], // NumberOfStudyRelatedSeries
              "00201208": firstInstance["00201208"], // NumberOfStudyRelatedInstances
            };
          }

          return study; // Fallback to original study data if metadata fetch fails
        } catch (error) {
          console.error(`Error fetching metadata for study:`, error);
          return study; // Return original study data if metadata fetch fails
        }
      }),
    );

    // Filter out null studies and return the detailed data
    const filteredStudyDetails = studyDetails.filter((study) => study !== null);

    return NextResponse.json({ data: filteredStudyDetails });
  } catch (err: unknown) {
    console.error("Error fetching studies:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
