export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const backend = process.env.NEXT_PUBLIC_BACKEND_BASE || "http://127.0.0.1:8000";
  const r = await fetch(`${backend}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  const headers = new Headers();
  headers.set("Content-Type", r.headers.get("content-type") || "application/json");
  return new Response(text, { status: r.status, headers });
}

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_BASE || "http://127.0.0.1:8000";
  const r = await fetch(`${backend}/v1/chat/config`, { cache: "no-store" });
  const text = await r.text();
  const headers = new Headers();
  headers.set("Content-Type", r.headers.get("content-type") || "application/json");
  return new Response(text, { status: r.status, headers });
}
