import MainSetup from "../React/MainSetupReact";

export interface SbLevels {
    repos: "none" | "read" | "write";
    psDb: "none" | "ro" | "rw";
    drive: "none" | "connector";
    mail: string[];
}
export interface SbEntry {
    id: number;
    personId: number;
    statusCode: "INVITED" | "ACTIVE" | "BLOCKED" | "REVOKED";
    githubLogin: string | null;
    githubInvitationId: number | null;
    drivePermissionId: string | null;
    isGrantedManually: boolean;
    levels?: SbLevels;
    canManageSb?: boolean;
    /** Klucz publiczny komputera pracownika (instalator SB); null = brak klucza. */
    publicKeyJwk?: SbPublicKeyJwk | null;
    keyThumbprint?: string | null;
    keyFingerprint?: string | null;
    /** Nazwy haseł, które wynikają z uprawnień (reguła w PS) i które już udostępniono. */
    secretsExpected?: string[];
    secretsGiven?: string[];
    createdAt: string;
    updatedAt: string;
    name: string;
    surname: string;
    systemEmail: string | null;
}
export interface SbPublicKeyJwk { kty: "RSA"; n: string; e: "AQAB" }
export interface SbCandidate {
    personId: number;
    name: string;
    surname: string;
    systemEmail: string | null;
    systemRoleName: string | null;
    statusCode: null | "REVOKED";
}
export interface SbEvent {
    id: number;
    personId: number;
    actionCode: string;
    actionName: string;
    resultCode: "OK" | "PARTIAL" | "FAILED";
    note: string | null;
    createdAt: string;
    requestedByName: string | null;
    requestedBySurname: string | null;
}
export interface SbUnlinkedMember { login: string; profileUrl: string }
export type SbAction = "invite" | "block" | "unblock" | "revoke" | "assign";
export type SbFailure = { ok: false; status: number; message: string };
export type SbFetchResult<T> = { ok: true; data: T } | SbFailure;
export type SbOperationResult = { ok: true; result: "OK" | "PARTIAL"; note: string } | SbFailure;

async function request<T>(route: string, init: RequestInit = {}): Promise<SbFetchResult<T>> {
    let response: Response;
    try {
        response = await fetch(`${MainSetup.serverUrl}sbAccess/${route}`, { ...init, credentials: "include" });
    } catch { return { ok: false, status: 0, message: "" }; }
    try {
        const body = await response.json();
        return response.ok ? { ok: true, data: body } : {
            ok: false, status: response.status, message: typeof body?.errorMessage === "string" ? body.errorMessage : "",
        };
    } catch {
        // Odpowiedź bez JSON zachowuje kod HTTP, a nie udaje braku sieci.
        return { ok: false, status: response.status, message: "" };
    }
}
export const fetchSbEntries = () => request<SbEntry[]>("entries");
export const fetchSbCandidates = () => request<SbCandidate[]>("candidates");
export const fetchSbUnlinkedMembers = () => request<SbUnlinkedMember[]>("githubMembers/unlinked");
export const fetchSbEvents = (personId: number) => request<SbEvent[]>(`${personId}/events`);
export async function performSbAction(personId: number, action: SbAction, githubLogin?: string): Promise<SbOperationResult> {
    const response = await request<{ result: "OK" | "PARTIAL"; note: string }>(
        `${personId}/${action === "assign" ? "githubAccount" : action}`,
        action === "assign" ? {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ githubLogin }),
        } : { method: "POST" },
    );
    if (!response.ok) return response;
    if ((response.data?.result !== "OK" && response.data?.result !== "PARTIAL") || typeof response.data.note !== "string")
        return { ok: false, status: 200, message: "Nieprawidłowa odpowiedź serwera PS." };
    return { ok: true, result: response.data.result, note: response.data.note };
}
export async function setSbLevels(personId: number, levels: SbLevels): Promise<SbFetchResult<SbEntry>> {
    return request<SbEntry>(`${personId}/levels`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(levels),
    });
}
/** Wysyła wyłącznie szyfrogram i odcisk klucza, którym szyfrowano; jawne hasło nie opuszcza przeglądarki. */
export function giveSbSecret(personId: number, name: string, ciphertext: string, keyThumbprint: string) {
    return request<{ name: string; given: true }>(`${personId}/secrets/${encodeURIComponent(name)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ciphertext, keyThumbprint }),
    });
}
export const takeSbSecret = (personId: number, name: string) =>
    request<{ name: string; given: false }>(`${personId}/secrets/${encodeURIComponent(name)}`, { method: "DELETE" });
