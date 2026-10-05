import { NextRequest, NextResponse } from "next/server";
import { fetchPSX } from "../../../../lib/api-fetcher";

// Next.js Native Edge Caching (ISR)
// Caches historical/symbol data and revalidates once per minute per symbol.
export const revalidate = 60;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await context.params;
        
        if (!symbol) {
            return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
        }

        // Fetching specific stock details (and optionally historical chart data)
        const data = await fetchPSX(`/stocks/${symbol}/historical`);
        
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Failed to fetch stock data for symbol:`, error);
        return NextResponse.json(
            { error: "Failed to fetch stock data." },
            { status: 500 }
        );
    }
}
