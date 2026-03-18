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
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
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

    // GAS web apps run doPost on the initial request then return a 302.
    // We POST with redirect:manual to trigger doPost, then POST to the
    // redirect URL to get the JSON response back.
    const probe = await fetch(GAS_URL, {
      method: "POST",
      redirect: "manual",
      headers,
      body: jsonBody,
    });

    // No redirect — response is inline (shouldn't happen with GAS but handle it)
    if (probe.status < 300) {
      const text = await probe.text();
      if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(JSON.parse(text));
    }

    // GAS redirected — doPost has run. POST to redirect URL to get the response.
    const echoUrl = probe.headers.get("location") ?? GAS_URL;
    try {
      const res = await fetch(echoUrl, { method: "POST", headers, body: jsonBody });
      const text = await res.text();
      if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
        // Response isn't JSON but the write already happened — return ok
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(JSON.parse(text));
    } catch {
      // Network error on echo fetch — write already happened
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
