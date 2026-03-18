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

    // GAS web apps return a 302 redirect on POST. Node's fetch follows 302
    // by converting POST→GET (RFC 7231), which drops the body and calls
    // doGet instead of doPost. Fix: capture the redirect target manually,
    // then POST directly to that URL so the body is preserved.
    const probe = await fetch(GAS_URL, {
      method: "POST",
      redirect: "manual",
      headers,
      body: jsonBody,
    });

    // If no redirect, the probe response itself contains the result
    if (probe.status < 300) {
      const text = await probe.text();
      if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
        throw new Error(`GAS returned non-JSON response: ${text.slice(0, 120)}`);
      }
      return NextResponse.json(JSON.parse(text));
    }

    const targetUrl = probe.headers.get("location") ?? GAS_URL;
    const res = await fetch(targetUrl, { method: "POST", headers, body: jsonBody });
    const text = await res.text();
    if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
      throw new Error(`GAS returned non-JSON response: ${text.slice(0, 120)}`);
    }
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
