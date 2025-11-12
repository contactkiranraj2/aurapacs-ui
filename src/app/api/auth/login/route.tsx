import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Sign in user
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      console.error("Login failed:", authError);
      return NextResponse.json(
        { error: authError?.message || "Login failed" },
        { status: 401 }
      );
    }

    const user = authData.user;

    // 2️⃣ Optionally get user metadata
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role, // usually "authenticated"
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata, // your custom fields if added
    };

    console.log("Login successful:", userInfo);

    // 3️⃣ Return the info
    return NextResponse.json({
      message: "Login successful",
      user: userInfo,
      session: authData.session, // optional: include session tokens
    });
  } catch (err: unknown) {
    console.error("Unexpected login error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
