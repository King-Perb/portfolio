import { NextResponse } from "next/server";
import { fetchGitHubStats } from "@/lib/github";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const stats = await fetchGitHubStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GitHub API error:", error);
    
    // Return error response but don't throw - let client handle fallback
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 500 }
    );
  }
}










