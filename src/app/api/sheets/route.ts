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

    // GAS web apps process the POST then return a 302 to an echo URL.
    // Capture the redirect manually so we can GET the echo URL for the response.
    const probe = await fetch(GAS_URL, {
      method: "POST",
      redirect: "manual",
      headers,
      body: jsonBody,
    });

    // No redirect — response is inline
    if (probe.status < 300) {
      const text = await probe.text();
      if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
        throw new Error(`GAS returned non-JSON: ${text.slice(0, 120)}`);
      }
      return NextResponse.json(JSON.parse(text));
    }

    // Follow redirect with GET to retrieve the JSON echo response
    const echoUrl = probe.headers.get("location") ?? GAS_URL;
    const res = await fetch(echoUrl, { method: "GET" });
    const text = await res.text();
    if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
      throw new Error(`GAS echo returned non-JSON: ${text.slice(0, 120)}`);
    }
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
