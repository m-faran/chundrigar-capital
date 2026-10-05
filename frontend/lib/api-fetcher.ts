export const PSX_API_BASE = "https://psxdata-api.fastapicloud.dev";

/**
 * A generalized fetcher for the PSX Data API that safely injects the proxy 
 * header if configured in Vercel environment variables, completely protecting
 * the Edge IPs from rate limits if a proxy is provided.
 */
export async function fetchPSX(endpoint: string, init?: RequestInit) {
    const url = `${PSX_API_BASE}${endpoint}`;
    
    // Create new headers object
    const headers = new Headers(init?.headers);
    
    // Inject the X-PSX-Proxy header if defined in env (e.g. Vercel)
    const proxyUrl = process.env.PSX_PROXY_URL;
    if (proxyUrl) {
        headers.append("X-PSX-Proxy", proxyUrl);
    }

    try {
        const response = await fetch(url, {
            ...init,
            headers,
        });

        if (!response.ok) {
            console.error(`PSX API Error: ${response.status} - ${response.statusText}`);
            throw new Error(`Failed to fetch from PSX API: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("fetchPSX Error:", error);
        throw error;
    }
}
