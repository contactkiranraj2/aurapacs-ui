import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async (
  req: Request,
  { params }: { params: { id: string; seriesId: string; instanceId: string } },
) => {
  try {
    const {
      id: studyInstanceUID,
      seriesId: seriesInstanceUID,
      instanceId: sopInstanceUID,
    } = params;

    if (!process.env.GCP_KEYFILE_JSON) {
      throw new Error("Missing GCP_KEYFILE_JSON env variable");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GCP_KEYFILE_JSON),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });
    const parent = `projects/ferrous-osprey-473710-t6/locations/asia-south1/datasets/Aurapacs-dataset/dicomStores/aurapacs-data-store`;

    const instanceResponse =
      await healthcare.projects.locations.datasets.dicomStores.studies.series.instances.retrieveInstance(
        {
          parent,
          dicomWebPath: `studies/${studyInstanceUID}/series/${seriesInstanceUID}/instances/${sopInstanceUID}`,
        },
        {
          headers: { Accept: "application/dicom" },
          responseType: "arraybuffer",
        },
      );

    const instanceData: ArrayBuffer = instanceResponse.data as ArrayBuffer;

    return new NextResponse(instanceData, {
      headers: {
        "Content-Type": "application/dicom",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Error fetching DICOM instance:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
