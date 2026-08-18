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
import { mapSkillDictionaryDtoToModel, SkillDictionaryDto } from "../Admin/SkillsDictionary/skillsDictionaryApi";
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
        return (result as SkillDictionaryDto[]).map(mapSkillDictionaryDtoToModel);
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
 * Payload bez ani jednego zdefiniowanego pola nie ma czego zapisać — nie wysyłamy żądania.
 *
 * Dla konta jest to wręcz konieczne: serwer odrzuca pusty PUT (400 "Brak danych konta do
 * aktualizacji" — patrz `hasAccountUpsertWriteField` w PS-nodeJS/src/persons/PersonsRouters.ts),
 * a moduł Persons woła zapis z pustym `{}` przy KAŻDEJ edycji osoby. Dopóki błędy szły tylko
 * do konsoli, nikt tego nie widział; skoro teraz trafiają do modala, pusty payload musi
 * po prostu nie generować żądania.
 *
 * Dla profilu serwer pustego PUT-a nie odrzuca, tylko zakłada PUSTY wiersz `PersonProfiles`
 * — czyli robi zapis "na zapas" za każdą edycję osoby. Nie jest potrzebny: moduły profilu
 * (wykształcenie, doświadczenie, umiejętności) tworzą ten wiersz same, leniwie, przy
 * pierwszym realnym wpisie (`ensurePersonProfileId` w ich repozytoriach), a `GET .../profile`
 * dla brakującego wiersza zwraca `null`, co UI obsługuje ("Brak profilu").
 */
function hasAnyFieldToWrite(payload: Record<string, unknown>): boolean {
    return Object.values(payload).some((value) => value !== undefined);
}

/**
 * Wspolna funkcja zapisu account + profile v2 z ujednolicona obsluga bledow.
 * Kolejnosc: account -> profile (sekwencyjnie).
 * Funkcja nie rzuca -- kazdy blad jest logowany i zwracany w tablicy errors, zeby
 * wywolujacy sam zdecydowal, co z nim zrobic. Modale osob i uzytkownikow systemu
 * podaja te tablice do `throwOnSaveErrors`, dzieki czemu blad widac w pasku bledu.
 *
 * @param personId - identyfikator osoby
 * @param accountPayload - payload account (pusty {} => PUT jest pomijany)
 * @param profilePayload - payload profile (pusty {} => PUT jest pomijany)
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
    if (hasAnyFieldToWrite(accountPayload)) {
        try {
            result.account = await putPersonAccountV2(personId, accountPayload);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            result.errors.push(`Konto systemowe: ${msg}`);
            console.warn("[%s] savePersonV2: blad PUT account dla personId=%d: %s", callerContext, personId, msg);
        }
    }

    // Profile drugi
    if (hasAnyFieldToWrite(profilePayload)) {
        try {
            result.profile = await putPersonProfileV2(personId, profilePayload);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            result.errors.push(`Profil osoby: ${msg}`);
            console.warn("[%s] savePersonV2: blad PUT profile dla personId=%d: %s", callerContext, personId, msg);
        }
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

/**
 * Zamienia zebrane błędy domknięcia zapisu w wyjątek, który `GeneralModal` pokaże
 * w pasku błędu (`handleSubmitRepository` łapie go i ustawia `errorMessage`).
 *
 * Tak dotąd ginął konflikt SystemEmail (`PERSON_ACCOUNT_SYSTEM_EMAIL_CONFLICT`):
 * dane osoby zapisywały się, konto NIE, a modal zamykał się jak po udanym zapisie —
 * użytkownik nie miał żadnego sygnału, że coś nie przeszło.
 *
 * Wołać PO callbacku odświeżającym listę: dane legacy są już w bazie, więc lista
 * ma pokazać ich nową wersję niezależnie od tego, że domknięcie się nie udało.
 */
export function throwOnSaveErrors(errors: string[]): void {
    if (errors.length === 0) return;
    throw new Error(`Dane osoby zapisano, ale część danych NIE została zapisana:\n${errors.join("\n")}`);
}

/** Projekt przypisany pracownikowi kontraktowemu (kształt zgodny z ProjectSelector). */
export type ProjectAssignment = {
    ourId: string;
    name: string;
};

/** Projekty przypisane osobie (rola CONTRACT_WORKER). */
export async function fetchPersonProjectAssignments(personId: number): Promise<ProjectAssignment[]> {
    const validId = validatePersonId(personId, "GET project-assignments");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/project-assignments`;
    const result = await ToolsFetch.fetchJsonWithSafeError(url, {
        method: "GET",
        credentials: "include",
    });
    return result?.assignments ?? [];
}

/**
 * Ustawia komplet przypisań osoby. Pusta tablica czyści przypisania - tak wygląda
 * zmiana roli na inną niż pracownik kontraktowy.
 */
export async function savePersonProjectAssignments(
    personId: number,
    projectOurIds: string[],
): Promise<ProjectAssignment[]> {
    const validId = validatePersonId(personId, "PUT project-assignments");
    const url = `${MainSetup.serverUrl}v2/persons/${validId}/project-assignments`;
    const result = await ToolsFetch.fetchJsonWithSafeError(url, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectOurIds }),
    });
    return result?.assignments ?? [];
}
