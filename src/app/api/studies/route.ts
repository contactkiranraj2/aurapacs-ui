import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const GET = async () => {
  const log = (...args: any[]) =>
    console.log(`[${new Date().toISOString()}]`, ...args);

  try {
    const cookieStore = await cookies(); // ✅ must await in Next 14.2+

    log("🔹 Starting /api/studies GET request");

    const cookieNames = (await cookieStore.getAll()).map((c) => c.name);
    log("Cookies available:", cookieNames);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const value = (await cookieStore.get(name))?.value;
            log("🍪 get cookie:", name, value ? "✅ found" : "❌ missing");
            return value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            log("🍪 set cookie:", name);
            await cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            log("🍪 remove cookie:", name);
            await cookieStore.set({
              name,
              value: "",
              expires: new Date(0),
              ...options,
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) log("❌ Supabase auth error:", userError.message);

    if (!user) {
      log("🚫 Unauthorized access - no user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    log("✅ Authenticated user:", {
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at,
    });

    const { data: studies, error: dbError } = await supabase
      .from("studies")
      .select(
        "patient_name, patient_id, patient_age, patient_sex, study_date, modality, instance_count, study_description, study_instance_uid, status"
      )
      .eq("user_id", user.id);

    if (dbError) {
      log("❌ Supabase DB error:", dbError.message);
      return NextResponse.json(
        { error: "Could not fetch user studies" },
        { status: 500 }
      );
    }

    log(`📊 Found ${studies?.length || 0} studies for user:`, user.email);

    const formattedStudies = (studies ?? []).map((study) => ({
      "00100010": { Value: [study.patient_name ?? ""] },
      "00100020": { Value: [study.patient_id ?? ""] },
      "00101010": { Value: [study.patient_age ?? ""] },
      "00100040": { Value: [study.patient_sex ?? ""] },
      "00080020": { Value: [study.study_date ?? ""] },
      "00080060": { Value: [study.modality ?? ""] },
      "00201208": { Value: [study.instance_count ?? 0] },
      "00081030": { Value: [study.study_description ?? ""] },
      "0020000D": { Value: [study.study_instance_uid ?? ""] },
      status: study.status ?? "unknown",
    }));

    log("✅ Successfully formatted studies");

    return NextResponse.json({ data: formattedStudies });
  } catch (err: unknown) {
    console.error("💥 Unexpected error in /api/studies:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
