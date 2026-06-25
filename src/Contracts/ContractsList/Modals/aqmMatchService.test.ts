/**
 * Tests for AQM match service — WS10/N4 (L11).
 *
 * The live PS proxy endpoint is PARKED to N5. Here we verify:
 * 1. The service function correctly calls the PS proxy URL (no AQM token in browser).
 * 2. The 3-state result (NIP / NAME / NONE) is correctly parsed and returned.
 * 3. Non-200 responses throw errors.
 *
 * Security check: confirm the URL targets the PS proxy path, NOT the AQM base URL directly.
 */
import { describe, it, expect, vi } from "vitest";
import { fetchAqmMatch, AqmMatchResponse } from "./aqmMatchService";

function makeFetcher(response: AqmMatchResponse, status = 200): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: async () => response,
    }) as unknown as typeof fetch;
}

function makeErrorFetcher(status: number): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: "server error" }),
    }) as unknown as typeof fetch;
}

describe("fetchAqmMatch — 3 match states (mocked)", () => {
    it("NIP match: returns match='NIP' with organization", async () => {
        const mockResponse: AqmMatchResponse = {
            match: "NIP",
            organization: { id: 42, name: "PWiK Sp. z o.o.", taxNr: "5260250995", hasLegacyEntityId: true },
        };
        const fetcher = makeFetcher(mockResponse);

        const result = await fetchAqmMatch("5260250995", undefined, fetcher);

        expect(result.match).toBe("NIP");
        expect(result.organization?.taxNr).toBe("5260250995");
        expect(result.organization?.id).toBe(42);
    });

    it("NAME match: returns match='NAME' with organization (no taxNr)", async () => {
        const mockResponse: AqmMatchResponse = {
            match: "NAME",
            organization: { id: 7, name: "PWiK Miejskie", taxNr: null, hasLegacyEntityId: false },
        };
        const fetcher = makeFetcher(mockResponse);

        const result = await fetchAqmMatch("1234563218", "PWiK Miejskie", fetcher);

        expect(result.match).toBe("NAME");
        expect(result.organization?.name).toBe("PWiK Miejskie");
        expect(result.organization?.taxNr).toBeNull();
    });

    it("NONE match: returns match='NONE' with null organization", async () => {
        const mockResponse: AqmMatchResponse = {
            match: "NONE",
            organization: null,
        };
        const fetcher = makeFetcher(mockResponse);

        const result = await fetchAqmMatch("7740001454", undefined, fetcher);

        expect(result.match).toBe("NONE");
        expect(result.organization).toBeNull();
    });
});

describe("fetchAqmMatch — proxy URL security check", () => {
    it("calls PS proxy path (not AQM directly) — no AQM token in browser", async () => {
        const mockResponse: AqmMatchResponse = { match: "NONE", organization: null };
        const fetcher = makeFetcher(mockResponse);

        await fetchAqmMatch("5260250995", undefined, fetcher);

        expect(fetcher).toHaveBeenCalledOnce();
        const calledUrl = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;

        // Must NOT contain AQM production domain or a Bearer token hint
        expect(calledUrl).not.toContain("e-aquamatic.pl");
        expect(calledUrl).not.toContain("api/integrations/ps-envi");
        // Must contain the PS proxy segment
        expect(calledUrl).toContain("aqm/match");
        expect(calledUrl).toContain("taxNr=5260250995");
    });

    it("includes name param when provided", async () => {
        const mockResponse: AqmMatchResponse = { match: "NAME", organization: null };
        const fetcher = makeFetcher(mockResponse);

        await fetchAqmMatch("5260250995", "PWiK ABC", fetcher);

        const calledUrl = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
        expect(calledUrl).toContain("name=PWiK+ABC");
    });

    it("omits name param when not provided", async () => {
        const mockResponse: AqmMatchResponse = { match: "NONE", organization: null };
        const fetcher = makeFetcher(mockResponse);

        await fetchAqmMatch("5260250995", undefined, fetcher);

        const calledUrl = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
        expect(calledUrl).not.toContain("name=");
    });
});

describe("fetchAqmMatch — error handling", () => {
    it("throws on non-200 response", async () => {
        const fetcher = makeErrorFetcher(500);
        await expect(fetchAqmMatch("5260250995", undefined, fetcher)).rejects.toThrow("AQM match proxy error: 500");
    });

    it("throws on 401 response", async () => {
        const fetcher = makeErrorFetcher(401);
        await expect(fetchAqmMatch("5260250995", undefined, fetcher)).rejects.toThrow("AQM match proxy error: 401");
    });
});
