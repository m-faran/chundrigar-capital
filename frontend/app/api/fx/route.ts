import { NextResponse } from "next/server";

// Next.js Native Edge Caching (ISR)
// Caches FX rates for 60 seconds since they don't fluctuate rapidly minute-to-minute.
export const revalidate = 60;

export async function GET() {
    try {
        // Here we hit the specific PKR/USD FX exchange API.
        // Assuming there is an FX endpoint on the API or a different external API used for FX.
        // Since the exact endpoint wasn't provided in the prompt, this is a placeholder URL 
        // demonstrating the ISR caching approach.
        
        // Example: If PSX API has it: await fetchPSX("/fx?pair=PKR/USD")
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        
        const pkrRate = data?.rates?.PKR;

        if (!pkrRate) {
            throw new Error("PKR rate not found in response");
        }

        return NextResponse.json({ pair: "USD/PKR", rate: pkrRate });
    } catch (error) {
        console.error("Failed to fetch FX exchange rate:", error);
        return NextResponse.json(
            { error: "Failed to fetch exchange rate." },
            { status: 500 }
        );
    }
}
