import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { verifySessionToken } from "@/lib/auth";

// GET - Get company settings including base currency
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Get company settings
    const { data: company, error } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", payload.companyId)
      .single();

    if (error) {
      console.error("[API /api/company/settings] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return all company settings for System Settings page
    return NextResponse.json({
      settings: {
        id: company?.id,
        company_name: company?.company_name || "Your Company",
        company_slug: company?.company_slug || company?.company_name?.toLowerCase().replace(/\s+/g, '-') || "your-company",
        subscription_tier: company?.subscription_tier || "professional",
        subscription_status: company?.subscription_status || "active",
        base_currency: company?.base_currency || "USD",
        created_at: company?.created_at,
        updated_at: company?.updated_at
      },
      // Keep backward compatibility
      baseCurrency: company?.base_currency || "USD",
      companyName: company?.company_name
    });
  } catch (error) {
    console.error("[API /api/company/settings] Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
