/**
 * NIP-G1 — tests for the GUS lookup service. Modeled on
 * ../../Contracts/ContractsList/Modals/fidmanSyncService.test.ts (injectable fetcher).
 */
import { describe, it, expect, vi } from "vitest";
import { lookupNip, GusLookupResult } from "./gusLookupService";

function makeFetcher(response: unknown, status = 200): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: async () => response,
    }) as unknown as typeof fetch;
}

const found: GusLookupResult = {
    name: "T-MOBILE POLSKA SPÓŁKA AKCYJNA",
    address: "ul. Test-Krucza 12, 02-674 Warszawa",
    regon: "011417295",
    krs: "0000391193",
};

describe("lookupNip", () => {
    it("POSTs the nip and returns the mapped { name, address, ... }", async () => {
        const fetcher = makeFetcher(found);
        const result = await lookupNip("5261040567", fetcher);

        expect(result.name).toBe(found.name);
        expect(result.address).toBe(found.address);
        const [url, opts] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
        expect(url).toContain("entities/lookup-nip");
        expect(opts.method).toBe("POST");
        expect(JSON.parse(opts.body as string)).toEqual({ nip: "5261040567" });
    });

    it("400 (bad checksum) -> throws the backend { error } message", async () => {
        const fetcher = makeFetcher({ error: "Nieprawidłowy NIP (błędna suma kontrolna)" }, 400);
        await expect(lookupNip("1234567890", fetcher)).rejects.toThrow(/suma kontrolna/);
    });

    it("503 (not configured) -> throws the backend { error } message", async () => {
        const fetcher = makeFetcher({ error: "Wyszukiwanie GUS nie jest skonfigurowane (brak GUS_BIR_KEY)" }, 503);
        await expect(lookupNip("5261040567", fetcher)).rejects.toThrow(/GUS_BIR_KEY/);
    });

    it("404 (not found) -> throws the backend { error } message", async () => {
        const fetcher = makeFetcher({ error: "Nie znaleziono podmiotu o NIP 5261040567 w rejestrze GUS" }, 404);
        await expect(lookupNip("5261040567", fetcher)).rejects.toThrow(/Nie znaleziono/);
    });

    it("falls back to a status-code message when the error body is not JSON", async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => {
                throw new Error("not json");
            },
        }) as unknown as typeof fetch;

        await expect(lookupNip("5261040567", fetcher)).rejects.toThrow(/500/);
    });
});
