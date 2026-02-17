import {
    EducationSearchParams,
    ExperienceSearchParams,
    PersonAccountV2Payload,
    PersonProfileEducationV2Record,
    PersonProfileExperienceV2Record,
    PersonProfileSkillV2Record,
    PersonProfileV2Record,
    PersonProfileV2Payload,
    ProfileSkillSearchParams,
    SkillDictionaryRecord,
} from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";

/**
 * Waliduje personId przed wywolaniem endpointow v2.
 * Rzuca Error jesli personId nie jest dodatnia liczba calkowita.
 *
 * @param personId - identyfikator osoby (z repository.currentItems[0].id)
 * @param context - opcjonalny kontekst do komunikatu bledu (np. "GET account", "PUT profile")
 * @returns personId (typ number) -- zwraca wartosc dla wygody chainowania
 * @throws Error jesli personId jest undefined/null, nie jest liczba, <= 0 lub nie jest calkowita
 */
export function validatePersonId(personId: unknown, context?: string): number {
    if (personId == null) {
        throw new Error(`personId jest wymagany${context ? ` (${context})` : ""}`);
    }
    if (typeof personId !== "number" || !Number.isFinite(personId)) {
        throw new Error(`personId musi byc liczba, otrzymano: ${typeof personId}${context ? ` (${context})` : ""}`);
    }
    if (!Number.isInteger(personId) || personId <= 0) {
        throw new Error(
            `personId musi byc dodatnia liczba calkowita, otrzymano: ${personId}${context ? ` (${context})` : ""}`,
        );
    }
    return personId;
}

/**
 * Pobiera dane account v2 dla osoby.
 * @returns PersonAccountV2Payload lub null jesli brak account (404)
 */
export async function fetchPersonAccountV2(personId: number): Promise<PersonAccountV2Payload | null> {
    const validId = validatePersonId(personId, "GET account");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/account`;

    try {
        const result = await ToolsFetch.fetchJsonWithSafeError(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        return result as PersonAccountV2Payload;
    } catch (error) {
        // 404 lub brak danych -- zwracamy null
        console.warn("fetchPersonAccountV2: brak account dla personId=%d: %o", validId, error);
        return null;
    }
}

/**
 * Pobiera dane profile v2 dla osoby.
 * @returns PersonProfileV2Record lub null jesli brak profile (404)
 */
export async function fetchPersonProfileV2(personId: number): Promise<PersonProfileV2Record | null> {
    const validId = validatePersonId(personId, "GET profile");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/profile`;

    try {
        const result = await ToolsFetch.fetchJsonWithSafeError(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        return result as PersonProfileV2Record;
    } catch (error) {
        // 404 lub brak danych -- zwracamy null
        console.warn("fetchPersonProfileV2: brak profile dla personId=%d: %o", validId, error);
        return null;
    }
}

/**
 * Zapisuje dane account v2 dla osoby (PUT).
 * @returns zaktualizowany PersonAccountV2Payload
 * @throws Error jesli zapis sie nie powiedzie
 */
export async function putPersonAccountV2(
    personId: number,
    payload: Partial<PersonAccountV2Payload>,
): Promise<PersonAccountV2Payload> {
    const validId = validatePersonId(personId, "PUT account");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/account`;

    const result = await ToolsFetch.fetchJsonWithSafeError(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return result as PersonAccountV2Payload;
}

/**
 * Zapisuje dane profile v2 dla osoby (PUT).
 * @returns zaktualizowany PersonProfileV2Payload
 * @throws Error jesli zapis sie nie powiedzie
 */
export async function putPersonProfileV2(
    personId: number,
    payload: Partial<PersonProfileV2Payload>,
): Promise<PersonProfileV2Payload> {
    const validId = validatePersonId(personId, "PUT profile");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/profile`;

    const result = await ToolsFetch.fetchJsonWithSafeError(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return result as PersonProfileV2Payload;
}

async function searchProfileModule<TRecord, TSearchParams>(
    personId: number,
    modulePath: "experiences" | "educations" | "skills",
    orConditions: TSearchParams[],
    context: string,
): Promise<TRecord[]> {
    const validId = validatePersonId(personId, context);
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/profile/${modulePath}/search`;

    try {
        const result = await ToolsFetch.fetchJsonWithSafeError(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orConditions }),
        });
        return result as TRecord[];
    } catch (error) {
        console.warn("searchProfileModule: blad %s dla personId=%d: %o", modulePath, validId, error);
        return [];
    }
}

export async function fetchPersonProfileExperiences(
    personId: number,
    orConditions: ExperienceSearchParams[] = [],
): Promise<PersonProfileExperienceV2Record[]> {
    return searchProfileModule<PersonProfileExperienceV2Record, ExperienceSearchParams>(
        personId,
        "experiences",
        orConditions,
        "POST experiences/search",
    );
}

export async function fetchPersonProfileEducations(
    personId: number,
    orConditions: EducationSearchParams[] = [],
): Promise<PersonProfileEducationV2Record[]> {
    return searchProfileModule<PersonProfileEducationV2Record, EducationSearchParams>(
        personId,
        "educations",
        orConditions,
        "POST educations/search",
    );
}

export async function fetchPersonProfileSkills(
    personId: number,
    orConditions: ProfileSkillSearchParams[] = [],
): Promise<PersonProfileSkillV2Record[]> {
    return searchProfileModule<PersonProfileSkillV2Record, ProfileSkillSearchParams>(
        personId,
        "skills",
        orConditions,
        "POST skills/search",
    );
}

/**
 * Pobiera slownik skilli z wyszukiwaniem.
 * @param searchText - opcjonalny tekst do wyszukiwania
 * @returns tablica SkillDictionaryRecord
 */
export async function fetchSkillsDictionary(searchText?: string): Promise<SkillDictionaryRecord[]> {
    const url = `${MainSetup.serverUrl}v2/skills/search`;
    const trimmedSearchText = searchText?.trim();
    const orConditions = trimmedSearchText ? [{ searchText: trimmedSearchText }] : [];

    try {
        const result = await ToolsFetch.fetchJsonWithSafeError(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orConditions }),
        });
        return result as SkillDictionaryRecord[];
    } catch (error) {
        console.warn("fetchSkillsDictionary: blad pobierania skilli: %o", error);
        return [];
    }
}

export type SavePersonV2Result = {
    account: PersonAccountV2Payload | null;
    profile: PersonProfileV2Payload | null;
    errors: string[];
};

/**
 * Wspolna funkcja zapisu account + profile v2 z ujednolicona obsluga bledow.
 * Kolejnosc: account -> profile (sekwencyjnie).
 * Bledy nie blokuja UI -- dane legacy zapisaly sie poprawnie.
 * Kazdy blad jest logowany i zwracany w tablicy errors.
 *
 * @param personId - identyfikator osoby
 * @param accountPayload - payload account (moze byc pusty {})
 * @param profilePayload - payload profile (moze byc pusty {})
 * @param callerContext - kontekst wywolania do logow (np. "SystemUsers", "Persons")
 */
export async function savePersonV2AccountAndProfile(
    personId: number,
    accountPayload: Partial<PersonAccountV2Payload>,
    profilePayload: Partial<PersonProfileV2Payload>,
    callerContext: string,
): Promise<SavePersonV2Result> {
    const result: SavePersonV2Result = { account: null, profile: null, errors: [] };

    // Account pierwszy -- musi istniec przed profile
    try {
        result.account = await putPersonAccountV2(personId, accountPayload);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.errors.push(`PUT account: ${msg}`);
        console.warn("[%s] savePersonV2: blad PUT account dla personId=%d: %s", callerContext, personId, msg);
    }

    // Profile drugi
    try {
        result.profile = await putPersonProfileV2(personId, profilePayload);
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.errors.push(`PUT profile: ${msg}`);
        console.warn("[%s] savePersonV2: blad PUT profile dla personId=%d: %s", callerContext, personId, msg);
    }

    if (result.errors.length > 0) {
        console.warn(
            "[%s] savePersonV2: zapis v2 zakonczony z bledami dla personId=%d: %o",
            callerContext,
            personId,
            result.errors,
        );
    }

    return result;
}
