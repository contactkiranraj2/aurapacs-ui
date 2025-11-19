import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const log = (...args: any[]) =>
    console.log(`[${new Date().toISOString()}]`, ...args);

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // 🧹 Clear old Supabase cookies before new login
    const allCookies = await cookieStore.getAll();
    for (const c of allCookies) {
      if (c.name.startsWith("sb-")) {
        log("🧹 Clearing old cookie before new login:", c.name);
        await cookieStore.set({
          name: c.name,
          value: "",
          expires: new Date(0),
          path: "/",
        });
      }
    }

    // ⚙️ Create a response object — this will carry new cookies
    const response = NextResponse.json({}); // placeholder response

    // 🧩 Create Supabase server client with cookie management bound to response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: "",
              expires: new Date(0),
              ...options,
            });
          },
        },
      }
    );

    // 🔐 Sign in user — Supabase sets cookies via the response object
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData?.user) {
      log("❌ Login failed:", authError?.message);
      return NextResponse.json(
        { error: authError?.message || "Login failed" },
        { status: 401 }
      );
    }

    const user = authData.user;
    log("✅ Login successful for user:", user.email);

    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
    };

    // ✅ Return JSON while keeping cookies intact
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    
    return NextResponse.json(
      {
        message: "Login successful",
        user: userInfo,
        session: authData.session,
      },
      {
        headers, // includes Supabase cookies + Cache-Control
      }
    );
  } catch (err: unknown) {
    console.error("💥 Unexpected login error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
