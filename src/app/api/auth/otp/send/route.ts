import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 },
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires_at = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    const { error: deleteError } = await supabase
      .from("otp_codes")
      .delete()
      .eq("mobile", mobile);

    if (deleteError) {
      console.error("Failed to delete existing OTP:", deleteError);
    }

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({ mobile, otp, expires_at: expires_at.toISOString() });

    if (insertError) {
      console.error("Failed to insert OTP:", insertError);
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 },
      );
    }

    console.log(`OTP for ${mobile} is ${otp}`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err: unknown) {
    console.error("Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
