import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import dicomParser from "dicom-parser";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GCP_KEYFILE_JSON!),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const healthcare = google.healthcare({ version: "v1", auth });

    const parent = `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/datasets/${process.env.GCP_DATASET_ID}/dicomStores/${process.env.GCP_DICOM_STORE_ID}`;

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataSet = dicomParser.parseDicom(buffer);

      const studyInstanceUID = dataSet.string("x0020000d") || "Unknown-UID";
      const patientId = dataSet.string("x00100020") || "Unknown-ID";
      const patientName = dataSet.string("x00100010") || "Unknown-Name";
      let studyDate = dataSet.string("x00080020");
      const modality = dataSet.string("x00080060") || "Unknown";
      const studyDescription = dataSet.string("x00081030");
      const patientAge = dataSet.string("x00101010");
      const patientSex = dataSet.string("x00100040");

      const formattedDate = studyDate
        ? `${studyDate.slice(0, 4)}-${studyDate.slice(4, 6)}-${studyDate.slice(
            6,
            8
          )}`
        : new Date().toISOString().split("T")[0];

      // Step 1: Upsert study metadata in Supabase FIRST
      // // Build the RPC payload with defaults
      const rpcPayload = {
        p_study_instance_uid: studyInstanceUID, // 1
        p_user_id: user.id, // 2
        p_patient_id: patientId, // 3
        p_patient_name: patientName, // 4
        p_study_date: formattedDate, // 5
        p_study_description: studyDescription ?? "", // 6 – default to empty string
        p_modality: modality.substring(0, 10), // 7
        p_patient_age: patientAge ?? null, // 8 – default to NULL
        p_patient_sex: patientSex ? patientSex.substring(0, 10) : null, // 9
        p_file_path: `studies/${studyInstanceUID}`, // 10
        p_file_size: file.size, // 11
      };

      console.log("RPC payload being sent:", rpcPayload);

      const { error: rpcError } = await supabase.rpc(
        "upsert_study_and_increment_instance",
        rpcPayload
      );
      if (rpcError) {
        console.error(
          `Supabase RPC error for file: ${file.name}`,
          JSON.stringify(rpcError, null, 2)
        );
        throw new Error(`Failed to save metadata for ${file.name}`);
      }

      // Step 2: Attempt to upload to Google Cloud DICOM store
      try {
        await healthcare.projects.locations.datasets.dicomStores.storeInstances(
          {
            parent,
            dicomWebPath: "studies",
            requestBody: buffer,
            headers: {
              "Content-Type": "application/dicom",
              Accept: "application/dicom+json",
            },
          }
        );
      } catch (err: any) {
        // If upload fails (and it's not a simple conflict), roll back the database change.
        if (err.code !== 409) {
          console.error(
            `Google Cloud upload failed for ${file.name}. Rolling back database change.`,
            err
          );
          await supabase.rpc("delete_study_if_upload_fails", {
            p_study_instance_uid: studyInstanceUID,
            p_user_id: user.id,
          });
          // Re-throw the error to notify the client of the failure.
          throw new Error(`Upload to DICOM store failed for ${file.name}`);
        }
      }
    });

    await Promise.all(uploadPromises);

    return NextResponse.json({
      message: `Successfully processed ${files.length} files.`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Upload process error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
