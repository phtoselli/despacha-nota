import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTOTP } from "@/lib/totp";
import { decrypt } from "@/lib/encryption";
import { totpSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = totpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, email } = parsed.data;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get current user or find by email (during registration)
    let userId: string;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    } else if (email) {
      const { data: users } = await adminClient.auth.admin.listUsers();
      const foundUser = users?.users?.find((u) => u.email === email);
      if (!foundUser) {
        return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
      }
      userId = foundUser.id;
    } else {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Get TOTP secret
    const { data: settings } = await adminClient
      .from("user_settings")
      .select("totp_secret_encrypted")
      .eq("user_id", userId)
      .single();

    if (!settings?.totp_secret_encrypted) {
      return NextResponse.json({ error: "TOTP nao configurado" }, { status: 400 });
    }

    const secret = decrypt(settings.totp_secret_encrypted);
    const isValid = verifyTOTP(secret, code);

    if (!isValid) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 401 });
    }

    // Mark TOTP as verified
    await adminClient
      .from("user_settings")
      .update({ totp_verified: true })
      .eq("user_id", userId);

    // Set cookie for session verification
    const response = NextResponse.json({ success: true });
    response.cookies.set("totp_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("TOTP verify error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
