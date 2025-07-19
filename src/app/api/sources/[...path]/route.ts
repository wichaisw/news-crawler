import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Make this route static for export
export const dynamic = "force-static";

// Generate static params for all possible source files
export async function generateStaticParams() {
  const sourcesDir = path.join(process.cwd(), "sources");
  const params: { path: string[] }[] = [];

  try {
    if (fs.existsSync(sourcesDir)) {
      const sources = fs.readdirSync(sourcesDir);

      for (const source of sources) {
        const sourceDir = path.join(sourcesDir, source);
        if (fs.statSync(sourceDir).isDirectory()) {
          const files = fs.readdirSync(sourceDir);
          for (const file of files) {
            if (file.endsWith(".json")) {
              params.push({
                path: [source, file],
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn("Could not generate static params for sources:", error);
  }

  return params;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join("/");
    const fullPath = path.join(process.cwd(), "sources", filePath);

    // Security check: ensure the path is within the sources directory
    const normalizedPath = path.normalize(fullPath);
    const sourcesDir = path.join(process.cwd(), "sources");

    if (!normalizedPath.startsWith(sourcesDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Only serve JSON files
    if (!normalizedPath.endsWith(".json")) {
      return NextResponse.json(
        { error: "Only JSON files are allowed" },
        { status: 400 }
      );
    }

    const fileData = fs.readFileSync(normalizedPath, "utf-8");

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving source file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
