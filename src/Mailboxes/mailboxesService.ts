import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";

export interface MailboxRecord {
    id: number;
    code: string;
    address: string;
    projectId: number | null;
    contractId: number | null;
    statusCode: string;
    lastError: string | null;
    agentCopyStatus: "PENDING" | "SET" | "NONE";
    agentCopyLastError: string | null;
    /** Różny od null = hasło wydaje PS sam komputerom osób z dostępem (SKO); PS go nie pokazuje. */
    passwordVersion?: number | null;
    /** Skrzynka firmy dla wszystkich pracowników (SKO); skrzynki projektów mają to z reguły. */
    allEmployees?: boolean;
}

export interface MailboxCreationResult {
    _mailbox?: MailboxRecord;
    _mailboxCreated?: boolean;
    _mailboxError?: string;
}

export type MailboxSelectionValue = { mode: "project" | "separate" | "none"; address?: string };

export function suggestMailboxAddress(code: string): Promise<{ address: string }> {
    return ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}mailboxes/suggestion?code=${encodeURIComponent(code)}`, {
        credentials: "include",
    });
}

export async function fetchMailboxes(scope: { projectId?: number; contractId?: number }): Promise<MailboxRecord[]> {
    const query = scope.contractId ? `contractId=${scope.contractId}` : `projectId=${scope.projectId}`;
    const result = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}mailboxes?${query}`, {
        credentials: "include",
    });
    return result.mailboxes;
}

export function mailboxAction<T>(id: number, action: "provision" | "password" | "project" | "agentCopy"): Promise<T> {
    return ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}mailboxes/${id}/${action}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
    });
}
