/**
 * Server-side proxy to Google Apps Script.
 * Avoids CORS issues — all GAS calls go through this route.
 */
import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_SHEETS_API_URL;

export async function GET(request: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json({ error: "GAS URL not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const gasUrl = new URL(GAS_URL);
  searchParams.forEach((value, key) => gasUrl.searchParams.set(key, value));

  try {
    const res = await fetch(gasUrl.toString(), { cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: `GAS returned HTTP ${res.status}: ${text.slice(0, 500)}` },
        { status: 502 }
      );
    }
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json(
        { error: `GAS returned non-JSON (HTTP ${res.status}): ${text.slice(0, 500)}` },
        { status: 502 }
      );
    }
  } catch (err) {
    return NextResponse.json({ error: `Proxy fetch failed: ${String(err)}` }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!GAS_URL) {
    return NextResponse.json({ error: "GAS URL not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const jsonBody = JSON.stringify(body);
    const headers = { "Content-Type": "application/json" };

    // Step 1: POST with redirect:manual to capture the GAS redirect
    const probe = await fetch(GAS_URL, {
      method: "POST",
      redirect: "manual",
      headers,
      body: jsonBody,
    });

    const probeStatus = probe.status;
    const location = probe.headers.get("location");

    // No redirect — return inline response
    if (probeStatus < 300) {
      const text = await probe.text();
      try { return NextResponse.json(JSON.parse(text)); }
      catch { return NextResponse.json({ error: `GAS non-JSON (status ${probeStatus}): ${text.slice(0, 200)}` }, { status: 502 }); }
    }

    // Got a redirect but no location — unexpected
    if (!location) {
      return NextResponse.json({ error: `GAS returned ${probeStatus} with no Location header` }, { status: 502 });
    }

    // Step 2: POST to the redirect URL to execute doPost
    const res = await fetch(location, { method: "POST", headers, body: jsonBody });
    const text = await res.text();
    try { return NextResponse.json(JSON.parse(text)); }
    catch { return NextResponse.json({ error: `GAS echo non-JSON (status ${res.status}): ${text.slice(0, 200)}` }, { status: 502 }); }

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
