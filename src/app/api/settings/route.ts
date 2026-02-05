import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/encryption";
import { generateTOTPSecret, generateQRCode } from "@/lib/totp";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {
      auto_send: false,
      require_confirmation: true,
      totp_verified: false,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.government_api_key !== undefined) {
      updateData.government_api_key_encrypted = body.government_api_key
        ? encrypt(body.government_api_key)
        : null;
    }
    if (body.auto_send !== undefined) updateData.auto_send = body.auto_send;
    if (body.require_confirmation !== undefined) updateData.require_confirmation = body.require_confirmation;

    const { data, error } = await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      // If no row exists, insert
      if (error.code === "PGRST116") {
        const { data: inserted, error: insertError } = await supabase
          .from("user_settings")
          .insert({ user_id: user.id, ...updateData })
          .select()
          .single();
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
        return NextResponse.json(inserted);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const body = await request.json();

    if (body.action === "reset_totp") {
      const { secret, uri } = generateTOTPSecret(user.email || "user");
      const qrCode = await generateQRCode(uri);
      const encryptedSecret = encrypt(secret);

      const adminClient = createAdminClient();
      await adminClient
        .from("user_settings")
        .update({
          totp_secret_encrypted: encryptedSecret,
          totp_verified: false,
        })
        .eq("user_id", user.id);

      return NextResponse.json({ qrCode, secret });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
