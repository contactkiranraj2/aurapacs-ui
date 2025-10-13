import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use anon/public key for normal login
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 1️⃣ Sign in the user
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

    const userId = authData.user.id;

    // 2️⃣ Fetch user info from 'users' table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Failed to fetch user info:", userError);
    }

    // 3️⃣ Fetch tenant info from 'tenant_members' table
    const { data: tenantMembership, error: tenantError } = await supabase
      .from("tenant_members")
      .select(
        `
        role,
        tenants(id, name)
      `
      )
      .eq("user_id", userId)
      .single(); // assuming 1 tenant per user

    if (tenantError) {
      console.error("Failed to fetch tenant info:", tenantError);
    }
    console.log("Login successful", userData, tenantMembership);
    return NextResponse.json({
      message: "Login successful",
      user: userData || null,
      tenant: tenantMembership?.tenants || null,
      role: tenantMembership?.role || null,
    });
  } catch (err: any) {
    console.error("Unexpected login error:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
