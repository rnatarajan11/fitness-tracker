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
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
