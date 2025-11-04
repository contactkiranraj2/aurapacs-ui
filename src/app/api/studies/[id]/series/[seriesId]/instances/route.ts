import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async (
  req: Request,
  { params }: { params: { id: string, seriesId: string } }
) => {
  try {
    const { id: studyInstanceUID, seriesId: seriesInstanceUID } = params;

    if (!process.env.GCP_KEYFILE_JSON) {
      throw new Error("Missing GCP_KEYFILE_JSON env variable");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GCP_KEYFILE_JSON),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });
    const parent = `projects/ferrous-osprey-473710-t6/locations/asia-south1/datasets/Aurapacs-dataset/dicomStores/aurapacs-data-store`;

    // Fetch all instances for the first series
    const instancesResponse = await healthcare.projects.locations.datasets.dicomStores.studies.series.searchForInstances(
      {
        parent,
        dicomWebPath: `studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances`,
      },
      {
        headers: { Accept: "application/dicom+json" },
        responseType: "json",
      }
    );
    const instances = instancesResponse.data;

    return NextResponse.json({ instances });
  } catch (err: any) {
    console.error(`Error fetching instances for series ${params.seriesId}:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
