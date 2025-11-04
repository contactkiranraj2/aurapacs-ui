import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    console.log("📥 Received registration request");
    const body = await req.json();
    console.log("📄 Request body:", body);

    const { email, password, accountType, orgName } = body;

    if (!accountType || !["individual", "institution"].includes(accountType)) {
      console.warn("⚠️ Invalid accountType:", accountType);
      return NextResponse.json(
        { error: "Invalid accountType" },
        { status: 400 },
      );
    }

    let userId: string | undefined;

    // 1️⃣ If Individual → create Supabase Auth user
    if (accountType === "individual") {
      console.log("🩺 Registering individual user");

      if (!email || !password) {
        console.warn("⚠️ Missing email or password for individual");
        return NextResponse.json(
          { error: "Email and password required" },
          { status: 400 },
        );
      }

      console.log("🔑 Creating Supabase Auth user with email:", email);
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        console.error("❌ Supabase Auth createUser error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data.user) {
        console.error("❌ Supabase Auth returned no user data");
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 },
        );
      }

      userId = data.user.id;
      console.log("✅ Supabase Auth user created, userId:", userId);
    } else {
      console.log("🏢 Registering institution without user signup");
    }

    // 2️⃣ Create tenant
    const tenantName =
      accountType === "individual"
        ? `Personal-${email?.split("@")[0]}`
        : orgName || `Tenant-${Date.now()}`;

    console.log("📦 Creating tenant:", tenantName);
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert([{ name: tenantName }])
      .select()
      .single();

    if (tenantError) {
      console.error("❌ Tenant creation error:", tenantError);
      return NextResponse.json({ error: tenantError.message }, { status: 500 });
    }

    console.log("✅ Tenant created, tenantId:", tenantData.id);

    // 3️⃣ Add tenant_members if we have a user (individual)
    if (userId) {
      console.log("🔗 Adding tenant member for userId:", userId);
      const { error: memberError } = await supabaseAdmin
        .from("tenant_members")
        .insert([{ user_id: userId, tenant_id: tenantData.id, role: "owner" }]);

      if (memberError) {
        console.error("❌ Tenant member creation error:", memberError);
        return NextResponse.json(
          { error: memberError.message },
          { status: 500 },
        );
      }

      console.log("✅ Tenant member added for userId:", userId);
    }

    console.log("🎉 Registration successful for tenantId:", tenantData.id);

    return NextResponse.json({
      message: "Registration successful",
      tenantId: tenantData.id,
      userId: userId || null,
    });
  } catch (err: unknown) {
    console.error("🔥 Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
