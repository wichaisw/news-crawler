import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Make this route static for export
export const dynamic = "force-static";

export async function GET() {
  try {
    const datesFilePath = path.join(process.cwd(), "sources", "dates.json");

    if (!fs.existsSync(datesFilePath)) {
      return NextResponse.json(
        { error: "dates.json not found" },
        { status: 404 }
      );
    }

    const datesData = fs.readFileSync(datesFilePath, "utf-8");

    return new NextResponse(datesData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving dates.json:", error);
    return NextResponse.json(
      { error: "Failed to serve dates.json" },
      { status: 500 }
    );
  }
}
