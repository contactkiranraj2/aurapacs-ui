import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const GET = async () => {
  const log = (...args: any[]) =>
    console.log(`[${new Date().toISOString()}]`, ...args);

  try {
    const cookieStore = await cookies();

    log("🔹 Starting /api/studies GET request");
    log(
      "Cookies:",
      (await cookieStore.getAll()).map((c) => c.name),
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const allCookies = cookieStore.getAll();
            log("🍪 getAll:", allCookies.map((c) => c.name));
            return allCookies;
          },
          setAll() {
            // Read-only for GET requests
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

    log("✅ Authenticated user:", user.id);

    const { data: studies, error: dbError } = await supabase
      .from("studies")
      .select("*")
      .eq("user_id", user.id);

    if (dbError) {
      log("❌ Supabase DB error:", dbError.message);
      return NextResponse.json(
        { error: "Could not fetch studies" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: studies });
  } catch (err: unknown) {
    console.error("💥 Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
};
