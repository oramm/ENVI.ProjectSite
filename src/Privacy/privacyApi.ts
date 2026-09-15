import ToolsFetch from "../React/Tools/ToolsFetch";
import MainSetup from "../React/MainSetupReact";
export interface PrivacyNotice {
    scope: "SYSTEM" | "PUBLIC_PROFILE";
    version: string;
    revision: string;
    title: string;
    sections: { heading: string; text: string }[];
    isPlaceholder: boolean;
}
export interface PrivacyStatus { notice: PrivacyNotice; acknowledged: boolean; acknowledgedAt: string | null; }
export const PRIVACY_REQUIRED = "ps-privacy-required";
export async function systemPrivacy(ack?: PrivacyNotice): Promise<PrivacyStatus> {
    const response = await fetch(`${MainSetup.serverUrl}v2/privacy/system${ack ? "/acknowledgements" : ""}`, {
        credentials: "include", method: ack ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        ...(ack ? { body: JSON.stringify({ version: ack.version, revision: ack.revision, acknowledged: true }) } : {}),
    });
    if (!response.ok) throw Object.assign(new Error("Nie udało się pobrać lub zapisać informacji. Spróbuj ponownie."), { status: response.status });
    return response.json();
}
// Observe all interactive fetch callers, including legacy code not using ToolsFetch.
export function observePrivacyRequired(onRequired: () => void) {
    const original = window.fetch;
    const observed: typeof fetch = async (...args) => {
        const response = await original(...args);
        const url = String(args[0] instanceof Request ? args[0].url : args[0]);
        if (response.status === 428 && url.startsWith(MainSetup.serverUrl) && !url.includes("/public/")) onRequired();
        return response;
    };
    window.fetch = observed;
    return () => { if (window.fetch === observed) window.fetch = original; };
}

export type PersonPrivacyStatus =
    | { status: 'missing'; acknowledgedAt: null }
    | { status: 'confirmed' | 'outdated'; acknowledgedAt: string };

export function personPrivacyStatus(personId: number): Promise<PersonPrivacyStatus> {
    return ToolsFetch.fetchJsonWithSafeError(
        MainSetup.serverUrl + 'admin/staffMember/' + personId + '/privacy',
        { credentials: 'include', cache: 'no-store' },
    );
}
