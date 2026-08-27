import { NextRequest, NextResponse } from "next/server";

const allowed = new Set(["embedding-worker", "research-assistant-rag"]);

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { name, body } = await req.json();
    if (!allowed.has(name)) {
      return NextResponse.json({ error: "Function not allowed" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Server configuration is missing" }, { status: 500 });
    }

    const upstream = await fetch(`${url}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth,
        "apikey": key
      },
      body: JSON.stringify(body ?? {})
    });

    const payload = await upstream.json().catch(() => ({ error: "Invalid Edge Function response" }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
