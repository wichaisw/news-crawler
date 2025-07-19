import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Make this route static for export
export const dynamic = "force-static";

export async function POST() {
  try {
    // Revalidate the home page
    revalidatePath("/");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch {
    return NextResponse.json(
      { message: "Error revalidating" },
      { status: 500 }
    );
  }
}
