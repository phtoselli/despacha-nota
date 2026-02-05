import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTOTPSecret, generateQRCode } from "@/lib/totp";
import { encrypt } from "@/lib/encryption";
import { registerSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const adminClient = createAdminClient();

    // Create user via admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes("already")) {
        return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Generate TOTP secret
    const { secret, uri } = generateTOTPSecret(email);
    const qrCode = await generateQRCode(uri);
    const encryptedSecret = encrypt(secret);

    // Create user_settings with TOTP secret (not yet verified)
    await adminClient.from("user_settings").insert({
      user_id: userId,
      totp_secret_encrypted: encryptedSecret,
      totp_verified: false,
    });

    return NextResponse.json({
      qrCode,
      secret,
      email,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
