/**
 * SYNC-P2 — tests for the FIDman sync status/retry service.
 * Modeled on ./aqmMatchService.test.ts (injectable fetcher, PS proxy path).
 */
import { describe, it, expect, vi } from "vitest";
import { fetchFidmanSyncStatus, retryFidmanSync, FidmanSyncStatus } from "./fidmanSyncService";

function makeFetcher(response: FidmanSyncStatus, status = 200): typeof fetch {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: async () => response,
        text: async () => "",
    }) as unknown as typeof fetch;
}

const sentStatus: FidmanSyncStatus = {
    contractId: 42,
    kind: "contract.upsert",
    status: "SENT",
    skipReason: null,
    skipReasonLabel: null,
    lastError: null,
    attempts: 1,
    updatedAt: "2026-07-11T10:00:00.000Z",
};

const failedStatus: FidmanSyncStatus = {
    ...sentStatus,
    status: "FAILED",
    lastError: "HTTP 500 Server Error",
    attempts: 3,
};

const skippedStatus: FidmanSyncStatus = {
    ...sentStatus,
    status: "SKIPPED",
    skipReason: "NEEDS_DATA",
    skipReasonLabel: "FIDman potrzebuje uzupełnienia danych kontrahenta.",
};

describe("fetchFidmanSyncStatus", () => {
    it("calls the PS proxy status path for the given contract id", async () => {
        const fetcher = makeFetcher(sentStatus);
        const result = await fetchFidmanSyncStatus(42, fetcher);

        expect(result.status).toBe("SENT");
        expect(fetcher).toHaveBeenCalledOnce();
        const calledUrl = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
        expect(calledUrl).toContain("fidmanSync/contract/42/status");
    });

    it("surfaces FAILED status with lastError", async () => {
        const fetcher = makeFetcher(failedStatus);
        const result = await fetchFidmanSyncStatus(42, fetcher);
        expect(result.status).toBe("FAILED");
        expect(result.lastError).toContain("500");
    });

    it("surfaces SKIPPED status with reason + label (awizo braków)", async () => {
        const fetcher = makeFetcher(skippedStatus);
        const result = await fetchFidmanSyncStatus(42, fetcher);
        expect(result.status).toBe("SKIPPED");
        expect(result.skipReason).toBe("NEEDS_DATA");
        expect(result.skipReasonLabel).toBeTruthy();
    });

    it("throws on non-ok response", async () => {
        const fetcher = makeFetcher(sentStatus, 500);
        await expect(fetchFidmanSyncStatus(42, fetcher)).rejects.toThrow("500");
    });
});

describe("retryFidmanSync (\"dopchnij synchronizację\")", () => {
    it("POSTs to the retry path and returns the updated (cleared) status", async () => {
        const fetcher = makeFetcher(sentStatus); // after retry, FAILED -> SENT
        const result = await retryFidmanSync(42, fetcher);

        expect(result.status).toBe("SENT");
        const [url, opts] = (fetcher as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
        expect(url).toContain("fidmanSync/contract/42/retry");
        expect(opts.method).toBe("POST");
    });

    it("throws on non-ok response (e.g. no FAILED/SKIPPED row to retry)", async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            text: async () => "Brak wpisu FAILED/SKIPPED do ponowienia dla tego kontraktu",
        }) as unknown as typeof fetch;

        await expect(retryFidmanSync(42, fetcher)).rejects.toThrow(/404|Brak wpisu/);
    });
});
