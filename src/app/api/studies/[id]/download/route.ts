import { NextResponse } from "next/server";
import { google } from "googleapis";
import archiver from "archiver";
import { PassThrough } from "stream";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const studyUID = context.params.id;
    if (!studyUID) {
      return NextResponse.json({ error: "Missing Study UID" }, { status: 400 });
    }

    // ---- Google Cloud Setup ----
    const projectId = "ferrous-osprey-473710-t6";
    const cloudRegion = "asia-south1";
    const datasetId = "Aurapacs-dataset";
    const dicomStoreId = "aurapacs-data-store";
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });

    // ---- Step 1: Fetch series list ----
    const seriesRes =
      await healthcare.projects.locations.datasets.dicomStores.searchForSeries(
        {
          parent,
          dicomWebPath: `studies/${studyUID}`,
        },
        {
          headers: {
            Accept:
              'application/dicom+json, multipart/related; type="application/dicom"; transfer-syntax=*',
          },
        }
      );

    const seriesList = Array.isArray(seriesRes.data)
      ? seriesRes.data
      : seriesRes.data?.series || [];

    if (!seriesList || seriesList.length === 0) {
      return NextResponse.json({ error: "No series found" }, { status: 404 });
    }

    // ---- Step 2: Setup archiver (ZIP) ----
    const passthrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(passthrough);

    // ---- Step 3: Iterate all series and instances ----
    for (const series of seriesList) {
      const seriesUID = series["0020000E"]?.Value?.[0];
      if (!seriesUID) continue;

      const instancesRes =
        await healthcare.projects.locations.datasets.dicomStores.searchForInstances(
          {
            parent,
            dicomWebPath: `studies/${studyUID}/series/${seriesUID}`,
          },
          {
            headers: {
              Accept:
                'application/dicom+json, multipart/related; type="application/dicom"; transfer-syntax=*',
            },
          }
        );

      const instances = Array.isArray(instancesRes.data)
        ? instancesRes.data
        : instancesRes.data?.instances || [];

      for (const instance of instances) {
        const sopInstanceUID = instance["00080018"]?.Value?.[0];
        if (!sopInstanceUID) continue;

        // ✅ Use multipart/related for binary DICOM retrieval
        const dicomRes =
          await healthcare.projects.locations.datasets.dicomStores.retrieveInstance(
            {
              parent,
              dicomWebPath: `studies/${studyUID}/series/${seriesUID}/instances/${sopInstanceUID}`,
            },
            {
              responseType: "arraybuffer",
              headers: {
                Accept:
                  'multipart/related; type="application/dicom"; transfer-syntax=*',
              },
            }
          );

        const buffer = Buffer.from(dicomRes.data as ArrayBuffer);
        archive.append(buffer, { name: `${seriesUID}/${sopInstanceUID}.dcm` });
      }
    }

    // ---- Step 4: Finalize ZIP ----
    archive.finalize();

    // ---- Step 5: Convert to Web Stream ----
    const readable = new ReadableStream({
      start(controller) {
        passthrough.on("data", (chunk) => controller.enqueue(chunk));
        passthrough.on("end", () => controller.close());
        passthrough.on("error", (err) => controller.error(err));
      },
    });

    // ---- Step 6: Send Response ----
    return new NextResponse(readable, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${studyUID}.zip"`,
      },
    });
  } catch (err: any) {
    console.error("Download error:", err?.response?.data || err);
    return NextResponse.json(
      { error: err?.message || "Failed to download study" },
      { status: 500 }
    );
  }
}
