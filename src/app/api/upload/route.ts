import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Authenticate using service account JSON
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // absolute path to JSON
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });

    const cloudRegion = "asia-south1";
    const projectId = "ferrous-osprey-473710-t6";
    const datasetId = "Aurapacs-dataset";
    const dicomStoreId = "aurapacs-data-store";

    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

    // Convert uploaded file into a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to DICOM store
    const response =
      await healthcare.projects.locations.datasets.dicomStores.storeInstances({
        parent,
        dicomWebPath: "studies",
        requestBody: buffer,
        headers: {
          "Content-Type": "application/dicom",
          Accept: "application/dicom+json",
        },
      });

    return NextResponse.json({ message: "Uploaded", data: response.data });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
