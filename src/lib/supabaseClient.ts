import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const { userId, accountType, orgName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Determine tenant name
    let tenantName = orgName;
    if (!tenantName) {
      // fallback: create tenant name from userId (or could use email)
      tenantName = `Personal-${userId.substring(0, 8)}`;
    }

    // 1) Create tenant
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert([{ name: tenantName }])
      .select()
      .single();

    if (tenantError) {
      console.error("Tenant create error", tenantError);
      return NextResponse.json({ error: tenantError.message }, { status: 500 });
    }

    // 2) Add tenant_members entry as owner
    const { error: memberError } = await supabaseAdmin
      .from("tenant_members")
      .insert([{ user_id: userId, tenant_id: tenantData.id, role: "owner" }]);

    if (memberError) {
      console.error("Member create error", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Tenant and membership created",
      tenantId: tenantData.id,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
