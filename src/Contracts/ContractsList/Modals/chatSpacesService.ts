/**
 * Pokoje Google Chat kontraktów ENVI — warstwa HTTP i reguły czyste (bez Reacta).
 *
 * Backend: PS-nodeJS src/contracts/chatSpaces/ChatSpacesRouters.ts
 *   GET    {PS_API}contract/:id/chatSpaces   lista pokoi (najpierw pokoje projektu kontraktu)
 *   POST   {PS_API}contract/:id/chatSpace    { scope, displayName? } zakłada pokój
 *   PUT    {PS_API}contract/:id/chatSpace    { chatSpaceId } podpina istniejący
 *   DELETE {PS_API}contract/:id/chatSpace    odpina (pokój w Google zostaje)
 *   POST   {PS_API}contractReact             pole _chatSpaceSelection przy tworzeniu kontraktu
 *
 * Fetch idzie przez ToolsFetch (jak contractTemplatesTreeService): 401 kończy się
 * przejściem do logowania, a błędy serwera wracają jako czytelny komunikat.
 */
import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";

export const CHAT_SPACE_NAME_MAX = 128;

export type ChatSpaceScope = "contract" | "project";

/** Wartość pola formularza `_chatSpaceSelection` — dokładnie to, co przyjmuje serwer. */
export type ChatSpaceSelection =
    | { mode: "none" }
    | { mode: "new"; scope: ChatSpaceScope; displayName?: string }
    | { mode: "existing"; chatSpaceId: number };

export interface ChatSpaceListItem {
    id: number;
    googleName: string;
    displayName: string;
    uri: string | null;
    projectOurId: string | null;
    createdAt: string;
    createdByPersonId: number | null;
    isOfContractProject: boolean;
    isAttachedToContract: boolean;
}

/** Wynik per osoba. INVITED = zaproszenie wysłane (gość z Gmaila musi je przyjąć). */
export interface ChatMemberResult {
    email: string;
    state: "JOINED" | "INVITED" | "FAILED";
    error?: string;
}

export interface CreateChatSpaceResult {
    chatSpace: ChatSpaceListItem;
    members: ChatMemberResult[];
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Podpowiedź nazwy pokoju: `<oznaczenie> <alias albo nazwa>`, max 128 znaków — ta sama reguła co na serwerze. */
export function suggestChatSpaceName(ourId: string | undefined, alias: string | undefined, name: string | undefined) {
    const label = (alias || "").trim() || (name || "").trim();
    return `${ourId ?? ""} ${label}`.trim().slice(0, CHAT_SPACE_NAME_MAX);
}

export async function fetchContractChatSpaces(contractId: number): Promise<ChatSpaceListItem[]> {
    return ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}contract/${contractId}/chatSpaces`, {
        method: "GET",
        credentials: "include",
    });
}

/**
 * Lista pokoi dla kontraktu, który jeszcze nie istnieje (okno nowego kontraktu):
 * `GET /chatSpaces?projectOurId=`. Przy błędzie (np. brak uprawnień) zwraca `null`,
 * a formularz wtedy nie pokazuje wyboru „Istniejący pokój".
 */
export async function fetchChatSpacesForProject(projectOurId: string): Promise<ChatSpaceListItem[] | null> {
    try {
        const list = await ToolsFetch.fetchJsonWithSafeError(
            `${MainSetup.serverUrl}chatSpaces?projectOurId=${encodeURIComponent(projectOurId)}`,
            { method: "GET", credentials: "include" },
        );
        return Array.isArray(list) ? (list as ChatSpaceListItem[]) : null;
    } catch {
        return null;
    }
}

export async function createContractChatSpace(
    contractId: number,
    scope: ChatSpaceScope,
    displayName?: string,
): Promise<CreateChatSpaceResult> {
    return ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}contract/${contractId}/chatSpace`, {
        method: "POST",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({ scope, displayName: displayName?.trim() || undefined }),
    });
}

export async function attachContractChatSpace(contractId: number, chatSpaceId: number): Promise<ChatSpaceListItem> {
    const result = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}contract/${contractId}/chatSpace`, {
        method: "PUT",
        headers: JSON_HEADERS,
        credentials: "include",
        body: JSON.stringify({ chatSpaceId }),
    });
    return result.chatSpace as ChatSpaceListItem;
}

export async function detachContractChatSpace(contractId: number): Promise<void> {
    await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}contract/${contractId}/chatSpace`, {
        method: "DELETE",
        credentials: "include",
    });
}

/** Opis stanu członka po założeniu pokoju. INVITED to NIE „dodano". */
export function describeMemberState(member: ChatMemberResult): string {
    switch (member.state) {
        case "JOINED":
            return "dodano do pokoju";
        case "INVITED":
            return "zaproszenie wysłane (osoba z kontem Gmail musi je przyjąć)";
        default:
            return `nie udało się dodać${member.error ? `: ${member.error}` : ""}`;
    }
}
