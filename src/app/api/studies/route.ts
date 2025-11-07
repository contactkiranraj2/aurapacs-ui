import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const GET = async () => {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all studies for the current user directly from Supabase
    const { data: studies, error: dbError } = await supabase
      .from("studies")
      .select("*")
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json(
        { error: "Could not fetch user studies" },
        { status: 500 },
      );
    }

    // Format the data to match the structure the frontend expects
    const formattedStudies = studies.map((study) => ({
      "00100010": { Value: [study.patient_name] }, // PatientName
      "00100020": { Value: [study.patient_id] }, // PatientID
      "00101010": { Value: [study.patient_age] }, // PatientAge
      "00100040": { Value: [study.patient_sex] }, // PatientSex
      "00080020": { Value: [study.study_date] }, // StudyDate
      "00080060": { Value: [study.modality] }, // Modality
      "00201208": { Value: [study.instance_count] }, // NumberOfStudyRelatedInstances
      "00081030": { Value: [study.study_description] }, // StudyDescription
      "0020000D": { Value: [study.study_instance_uid] }, // StudyInstanceUID
      status: study.status,
    }));

    return NextResponse.json({ data: formattedStudies });
  } catch (err: unknown) {
    console.error("Error fetching studies:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
