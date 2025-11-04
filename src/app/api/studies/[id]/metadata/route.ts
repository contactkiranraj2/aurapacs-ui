import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const studyInstanceUID = params.id;

    if (!process.env.GCP_KEYFILE_JSON) {
      throw new Error("Missing GCP_KEYFILE_JSON env variable");
    }

    const credentials = JSON.parse(process.env.GCP_KEYFILE_JSON);
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });
    const parent = `projects/ferrous-osprey-473710-t6/locations/asia-south1/datasets/Aurapacs-dataset/dicomStores/aurapacs-data-store`;

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

    const metadata = metadataResponse.data;

    if (Array.isArray(metadata) && metadata.length > 0) {
      return NextResponse.json({ data: metadata[0] });
    }

    return NextResponse.json({ data: null });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Error fetching metadata for study ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
