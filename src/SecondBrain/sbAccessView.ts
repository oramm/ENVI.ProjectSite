import type { SbOwnAccessView } from "./sbAccessApi";

export function parseGithubLoginParam(value: string | null): string | null {
    const login = value?.trim().replace(/^@/, "");
    return login && /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(login) ? login : null;
}

export function describeLinkFailure(status: number, serverMessage: string): string {
    const fallback = `Nie udało się powiązać konta (kod ${status}).`;
    switch (status) {
        case 409: return serverMessage.trim() ? `${serverMessage} Gdy to zrobisz, kliknij przycisk jeszcze raz.` : fallback;
        case 422: return serverMessage.trim() ? serverMessage : fallback;
        case 503: return "Powiązanie konta nie jest jeszcze dostępne - usługa nie została skonfigurowana po stronie PS. Instalator i tak możesz uruchomić; spróbuj ponownie później albo poproś przełożonego.";
        case 502: return "Nie udało się teraz sprawdzić konta w GitHubie. Spróbuj za chwilę.";
        case 400: return "Nazwa konta GitHub w adresie strony jest nieprawidłowa.";
        case 401:
        case 403: return "Nie masz dostępu do tej czynności. Zaloguj się ponownie albo poproś przełożonego.";
        case 0: return "Brak połączenia z serwerem PS. Spróbuj ponownie.";
        default: return fallback;
    }
}

export function linkPanelMode(sb: SbOwnAccessView, login: string | null): "none" | "ask" | "already" | "other" {
    if (!login || sb.isGrantedManually) return "none";
    if (sb.githubState === "LINKED")
        return sb.githubLogin?.toLowerCase() === login.toLowerCase() ? "already" : "other";
    return "ask";
}
