import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const log = (...args: any[]) =>
    console.log(`[${new Date().toISOString()}]`, ...args);

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore.get(name))?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
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

    // Sign out user (Supabase revokes tokens)
    const { error } = await supabase.auth.signOut();
    if (error) {
      log("❌ Supabase signOut error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Manually remove any leftover cookies (e.g. rotating tokens)
    const allCookies = await cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith("sb-")) {
        log("🧹 Removing cookie:", c.name);
        await cookieStore.set({
          name: c.name,
          value: "",
          expires: new Date(0),
          path: "/",
        });
      }
    }

    log("✅ Logout successful — all Supabase cookies cleared");
    return NextResponse.json({ message: "Logout successful" });
  } catch (err: unknown) {
    console.error("💥 Logout error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
