import { NextResponse } from "next/server";
import { checkApiHealth } from "@/lib/focus-nfe/client";

export async function GET() {
  try {
    const status = await checkApiHealth();
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
