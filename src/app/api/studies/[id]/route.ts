import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  const studyId = params.id;

  try {
    console.log("Study id ", studyId);
    if (!process.env.GCP_KEYFILE_JSON) {
      throw new Error("Missing GCP_KEYFILE_JSON env variable");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GCP_KEYFILE_JSON),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });

    const parent = `projects/ferrous-osprey-473710-t6/locations/asia-south1/datasets/Aurapacs-dataset/dicomStores/aurapacs-data-store`;

    // Return WADO-RS URL for this study
    const wadoRsUrl = `https://healthcare.googleapis.com/v1/${parent}/dicomWeb/studies/${studyId}`;

    return NextResponse.json({ wadoRsUrl });
  } catch (err: any) {
    console.error("Error fetching study:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
