import MainSetup from "../../React/MainSetupReact";
import { TypesTreeData } from "./typesTreeModel";

/**
 * Odczyt hierarchii typów.
 *
 * Świadomie BEZ RepositoryReact - to nie jest lista CRUD-owa, tylko jeden odczyt
 * całego grafu (około 180 wierszy) bez paginacji i filtrów.
 */
export async function fetchTypesTree(): Promise<TypesTreeData> {
    const response = await fetch(MainSetup.serverUrl + "admin/typesTree", {
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 403) throw new Error("Brak uprawnień do panelu administracyjnego.");
        if (response.status === 401) throw new Error("Sesja wygasła - zaloguj się ponownie.");
        throw new Error(`Nie udało się pobrać hierarchii typów (kod ${response.status}).`);
    }

    return (await response.json()) as TypesTreeData;
}

export type NewMilestoneTypePayload = {
    name: string;
    description: string;
    isUniquePerContract: boolean;
    isInScrumByDefault: boolean;
    contractTypeId: number;
    folderNumber: string;
    isDefault: boolean;
};

export type NewCaseTypePayload = {
    milestoneTypeId: number;
    name: string;
    description: string;
    folderNumber: string;
    isDefault: boolean;
    isUniquePerMilestone: boolean;
    isInScrumByDefault: boolean;
    isSubCaseOnly: boolean;
};

/**
 * Zapis zwraca CAŁE odświeżone drzewo. Doklejanie pojedynczego węzła po stronie
 * klienta rozjechałoby widok z bazą przy pierwszej rozbieżności.
 */
async function sendToTree(
    method: "POST" | "PUT",
    path: string,
    payload: unknown,
): Promise<TypesTreeData> {
    const response = await fetch(MainSetup.serverUrl + path, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let message = `Nie udało się zapisać (kod ${response.status}).`;
        try {
            const body = await response.json();
            if (body?.errorMessage) message = body.errorMessage;
            else if (typeof body === "string" && body) message = body;
        } catch {
            /* odpowiedź bez treści JSON - zostaje komunikat domyślny */
        }
        throw new Error(message);
    }

    return (await response.json()) as TypesTreeData;
}

export function addMilestoneType(payload: NewMilestoneTypePayload) {
    return sendToTree("POST", "admin/typesTree/milestoneType", payload);
}

export function addCaseType(payload: NewCaseTypePayload) {
    return sendToTree("POST", "admin/typesTree/caseType", payload);
}

export function editMilestoneType(id: number, payload: NewMilestoneTypePayload) {
    return sendToTree("PUT", `admin/typesTree/milestoneType/${id}`, payload);
}

export function editCaseType(id: number, payload: Omit<NewCaseTypePayload, "milestoneTypeId">) {
    return sendToTree("PUT", `admin/typesTree/caseType/${id}`, payload);
}
