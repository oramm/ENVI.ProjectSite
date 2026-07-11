/**
 * SYNC-P2 — PS proxy abstraction for the FIDman sync status/retry surface.
 * Mirrors ./aqmMatchService.ts (injectable-fetcher pattern, PS backend proxy,
 * no third-party token in the browser).
 *
 * Backend: PS-nodeJS src/contracts/fidmanSync/FidmanSyncRouters.ts
 *   GET  {PS_API}fidmanSync/contract/:id/status
 *   POST {PS_API}fidmanSync/contract/:id/retry
 */
import MainSetup from "../../../React/MainSetupReact";

export type FidmanSyncStatusValue = "NONE" | "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export interface FidmanSyncStatus {
    contractId: number;
    kind: "contract.upsert";
    status: FidmanSyncStatusValue;
    skipReason: string | null;
    skipReasonLabel: string | null;
    lastError: string | null;
    attempts: number;
    updatedAt: string | null;
}

export async function fetchFidmanSyncStatus(
    contractId: number,
    fetcher: typeof fetch = fetch,
): Promise<FidmanSyncStatus> {
    const url = `${MainSetup.serverUrl}contract/${contractId}/fidmanSync/status`;
    const response = await fetcher(url, { method: "GET", credentials: "include" });
    if (!response.ok) {
        throw new Error(`Błąd odczytu statusu synchronizacji FIDman: ${response.status}`);
    }
    return response.json() as Promise<FidmanSyncStatus>;
}

/** Manual "dopchnij synchronizację" — re-delivers the last FAILED/SKIPPED row. */
export async function retryFidmanSync(
    contractId: number,
    fetcher: typeof fetch = fetch,
): Promise<FidmanSyncStatus> {
    const url = `${MainSetup.serverUrl}contract/${contractId}/fidmanSync/retry`;
    const response = await fetcher(url, { method: "POST", credentials: "include" });
    if (!response.ok) {
        // Backend errors come back as JSON { error }; read that, not the raw body
        // (a 404 { "error": "..." } must not render as a JSON blob in the Alert).
        const msg = await response
            .json()
            .then((body: { error?: string }) => body?.error)
            .catch(() => undefined);
        throw new Error(msg || `Błąd ponowienia synchronizacji FIDman: ${response.status}`);
    }
    return response.json() as Promise<FidmanSyncStatus>;
}
