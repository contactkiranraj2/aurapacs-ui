import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json(
        { error: "Mobile number and OTP are required" },
        { status: 400 },
      );
    }

    const { data: otpData, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("mobile", mobile)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    if (otpData.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("otp_codes")
      .delete()
      .eq("mobile", mobile);

    if (deleteError) {
      console.error("Failed to delete OTP:", deleteError);
    }

    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("phone", mobile)
      .single();

    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to verify OTP" },
        { status: 500 },
      );
    }

    if (!user) {
      const { data: newUser, error: newUserError } = await supabase.auth.admin.createUser({
        phone: mobile,
        phone_confirm: true,
      });

      if (newUserError || !newUser) {
        console.error("Error creating user:", newUserError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 },
        );
      }

      user = newUser.user
    }

    const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
        phone: mobile,
        password: 'password'
    })

    if(sessionError || !session){
        const { data: magicLink, error: magicLinkError } = await supabase.auth.signInWithOtp({
            phone: mobile,
        });

        if (magicLinkError) {
            console.error("Error sending magic link:", magicLinkError);
            return NextResponse.json(
              { error: "Failed to log in" },
              { status: 500 },
            );
        }
    }


    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
    }

    return NextResponse.json({
      message: "Login successful",
      user,
      role: profile?.role || null,
    });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
