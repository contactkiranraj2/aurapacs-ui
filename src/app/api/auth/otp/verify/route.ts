import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { mobile, otp } = await req.json();

  const cookieStore = await cookies();
  const response = NextResponse.json({ ok: true });

  // SSR supabase client for cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  // 1. Validate OTP
  const { data: otpData } = await admin
    .from("otp_codes")
    .select("*")
    .eq("mobile", mobile)
    .single();

  if (!otpData || otpData.otp !== otp)
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

  if (new Date(otpData.expires_at).getTime() < Date.now())
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });

  await admin.from("otp_codes").delete().eq("mobile", mobile);

  // 2. Shadow user email
  const email = `${mobile}@aurapacs.com`;

  // 3. Ensure user exists
  const { data: allUsers } = await admin.auth.admin.listUsers();
  let user = allUsers.users.find((u) => u.email === email);

  if (!user) {
    const { data: created } = await admin.auth.admin.createUser({
      email,
      email_confirm: false,
    });
    
    if (!created?.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    
    user = created.user;

    await admin.from("profiles").insert({
      id: user.id,
      mobile,
      role: "patient",
    });
  }

  // 4. Create a temporary password for this user (if not exists)
  // This allows us to use signInWithPassword which properly sets SSR cookies
  const tempPassword = `temp_${mobile}_${Date.now()}`;
  
  // Update user with password using admin client
  const { error: updateError } = await admin.auth.admin.updateUserById(
    user.id,
    { password: tempPassword }
  );

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update user credentials" },
      { status: 500 }
    );
  }

  // 5. Sign in using SSR client with the temporary password
  // This properly establishes the session and sets cookies
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    });

  if (authError || !authData.session) {
    return NextResponse.json(
      { error: "Failed to establish session" },
      { status: 500 }
    );
  }

  // Return tokens and user data in response body for client-side setSession
  const finalResponse = NextResponse.json(
    {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: authData.user,
    },
    {
      headers: response.headers, // Include the cookies set by Supabase SSR
    }
  );

  finalResponse.headers.set("Cache-Control", "no-store");

  return finalResponse;
}
