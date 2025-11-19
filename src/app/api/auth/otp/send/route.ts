import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { mobile } = await req.json();

  if (!mobile) {
    return NextResponse.json({ error: "Mobile required" }, { status: 400 });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = new Date(Date.now() + 2 * 60 * 1000);

  await supabase.from("otp_codes").delete().eq("mobile", mobile);
  await supabase
    .from("otp_codes")
    .insert({ mobile, otp, expires_at: expires.toISOString() });

  console.log("OTP sent:", otp);

  return NextResponse.json({ success: true });
}
