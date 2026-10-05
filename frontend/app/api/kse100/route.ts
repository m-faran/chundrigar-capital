import { NextResponse } from "next/server";
import { fetchPSX } from "../../../lib/api-fetcher";

// Next.js Native Edge Caching (ISR)
// Caches the response at the edge and revalidates in the background at most once every 15 seconds.
// This guarantees Vercel will never hit the 60 requests/min rate limit, 
// even with millions of simultaneous frontend requests.
export const revalidate = 15;

export async function GET() {
    try {
        // Fetch KSE 100 Data from PSX API
        // NOTE: Adjust the endpoint to match the exact KSE 100 endpoint of the PSX Data API
        const data = await fetchPSX("/stocks?index=KSE100");
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch KSE 100 data:", error);
        // Serve a 500 error gracefully so the UI doesn't crash
        return NextResponse.json(
            { error: "Failed to fetch KSE 100 index data." },
            { status: 500 }
        );
    }
}
