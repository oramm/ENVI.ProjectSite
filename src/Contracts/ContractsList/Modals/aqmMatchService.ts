/**
 * AQM match service — PS proxy abstraction for N4.
 *
 * SECURITY: the browser NEVER holds the AQM service token.
 * All calls go through PS backend proxy: GET {PS_API}/aqm/match?taxNr=<nip>
 * The PS backend adds the AQM Bearer token server-side.
 *
 * Live proxy endpoint is PARKED to N5. Here the function is wired but the
 * actual HTTP call is abstracted so unit tests can inject mock implementations.
 */
import MainSetup from "../../../React/MainSetupReact";

export type AqmMatchResult = "NIP" | "NAME" | "NONE";

export interface AqmMatchResponse {
    match: AqmMatchResult;
    organization: {
        id: number;
        name: string;
        taxNr: string | null;
        hasLegacyEntityId: boolean;
    } | null;
}

/**
 * Fetch AQM match state for a given NIP via the PS backend proxy.
 * N5: PS backend will forward to AQM GET …/api/integrations/ps-envi/match?taxNr=&name=
 * N4: this function exists and is testable via mock injection; no live AQM call.
 *
 * @param taxNr Normalized 10-digit NIP string
 * @param name  Optional entity name (for NAME-match disambiguation)
 * @param fetcher Injectable fetch function — defaults to window.fetch (allows unit test mocking)
 */
export async function fetchAqmMatch(
    taxNr: string,
    name?: string,
    fetcher: typeof fetch = fetch,
): Promise<AqmMatchResponse> {
    const params = new URLSearchParams({ taxNr });
    if (name) params.set("name", name);

    // PS backend proxy path — no AQM token in the browser
    const url = `${MainSetup.serverUrl}aqm/match?${params.toString()}`;

    const response = await fetcher(url, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`AQM match proxy error: ${response.status}`);
    }

    return response.json() as Promise<AqmMatchResponse>;
}
