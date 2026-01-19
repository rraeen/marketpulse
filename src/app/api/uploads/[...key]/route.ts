import { NextResponse } from "next/server";
import { getObjectFromR2 } from "@/lib/r2";
import { Readable } from "stream";

function normalizeKey(parts: string[]): string | null {
  const decoded = parts.map((p) => decodeURIComponent(p));
  if (decoded.some((p) => p === ".." || p.includes("..") || p.includes("\\"))) return null;
  const key = decoded.join("/").replace(/^\/+/, "");
  if (!key) return null;
  return key;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: keyParts } = await params;
  const key = normalizeKey(keyParts);
  if (!key) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const obj = await getObjectFromR2(key);
    if (!obj.body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // AWS SDK returns a Node Readable stream in Node runtime.
    const nodeStream =
      obj.body instanceof Readable ? obj.body : Readable.from(obj.body as any);

    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": obj.contentType ?? "application/octet-stream",
        "Cache-Control":
          obj.cacheControl ?? "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    // R2/S3 will throw on missing keys; normalize to 404.
    const name = error?.name ?? "";
    const code = error?.$metadata?.httpStatusCode;
    if (name === "NoSuchKey" || name === "NotFound" || code === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("R2 download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

