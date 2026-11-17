import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";
import { SystemRoleName } from "../../../../Typings/bussinesTypes";

/**
 * Przegląd dostępów (plan DOSTEP, DOSTEP-7). Odpowiedź „widzi / skąd / dlaczego” liczy serwer
 * tymi samymi regułami, którymi wpuszcza żądania - front niczego tu nie wylicza sam.
 */
export type AccessArea = "projects" | "letters" | "mail" | "chat" | "offers" | "salesInvoices";
export type AccessSource = "rola" | "przypisanie" | "wyjątek";

export type AreaAccess = {
    area: AccessArea;
    sees: boolean;
    value: string;
    source: AccessSource | null;
    why: string;
};

export type PersonAccessView = {
    personId: number;
    name: string;
    surname: string;
    entityName: string | null;
    systemRoleId: number;
    role: SystemRoleName;
    assignments: { ourId: string; name: string }[];
    contractRoles: { projectOurId: string; contractId: number }[];
    letterContracts: string[];
    areas: AreaAccess[];
};

export const AREAS: [AccessArea, string][] = [
    ["projects", "Projekty i kontrakty"],
    ["letters", "Pisma i dokumenty"],
    ["mail", "Poczta projektu"],
    ["chat", "Pokój czatu projektu"],
    ["offers", "Oferty"],
    ["salesInvoices", "Faktury sprzedaży"],
];
export const AREA_LABEL = Object.fromEntries(AREAS) as Record<AccessArea, string>;
export const SOURCES: AccessSource[] = ["rola", "przypisanie", "wyjątek"];

export async function fetchAccessOverview(): Promise<PersonAccessView[]> {
    const result = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}v2/access-overview`, {
        method: "GET",
        credentials: "include",
    });
    return result?.persons ?? [];
}

export async function fetchPersonAccess(personId: number): Promise<PersonAccessView | null> {
    const result = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}v2/access-overview/${personId}`, {
        method: "GET",
        credentials: "include",
    });
    return result?.person ?? null;
}

/** Podgląd przed zapisem - niczego nie zapisuje. Bez personId = nowa osoba. */
export async function fetchAccessPreview(
    personId: number | undefined,
    systemRoleId: number,
    projectOurIds: string[],
): Promise<AreaAccess[]> {
    const result = await ToolsFetch.fetchJsonWithSafeError(`${MainSetup.serverUrl}v2/access-overview/preview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, systemRoleId, projectOurIds }),
    });
    return result?.areas ?? [];
}

export type OverviewFilter = {
    area: AccessArea;
    /** "" = wszyscy, "1" = mają dostęp, "0" = nie mają. */
    has: "" | "1" | "0";
    role: SystemRoleName | "";
    source: AccessSource | "";
    query: string;
};

/** Filtry przeglądu w trybie „jeden obszar”. */
export function filterOverview(persons: PersonAccessView[], f: OverviewFilter) {
    const q = f.query.trim().toLowerCase();
    return persons
        .filter((p) => !f.role || p.role === f.role)
        .filter((p) => !q || `${p.name} ${p.surname} ${p.entityName ?? ""}`.toLowerCase().includes(q))
        .map((p) => ({ person: p, access: p.areas.find((a) => a.area === f.area)! }))
        .filter(({ access }) => access && (f.has === "" || String(Number(access.sees)) === f.has))
        .filter(({ access }) => !f.source || access.source === f.source);
}
