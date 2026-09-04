import React from "react";
import { PersonAccountV2Payload, StaffMemberData, SystemUserData } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { GeneralAddNewModalButton } from "../../../View/Modals/GeneralModalButtons";
import { ModalSaveCallback, SpecificAddNewModalButtonProps } from "../../../View/Modals/ModalsTypes";
import {
    buildAccountPayload,
    savePersonV2AccountAndProfile,
    saveProjectAssignments,
    throwOnSaveErrors,
} from "../../../Persons/personsV2Helpers";
import { newUserRepository, staffMembersRepository } from "../StaffMembersController";
import { UserModalBody } from "./UserModalBody";
import { makeUserValidationSchema } from "./UserValidationSchema";

/**
 * Dodawanie użytkownika z okna „Personel i uprawnienia" (PER-3).
 *
 * Odtwarza przepływ skasowanego ekranu „Dodawanie użytkowników", bo to ten sam przepływ
 * i te same trasy - zmienia się tylko okno, w którym mieszka:
 *   1. `POST /person` zakłada osobę (serwer wycina z niej pola konta),
 *   2. `PUT /v2/persons/:id/account` zakłada konto: rolę, e-mail systemowy, FIDmana,
 *   3. `PUT /v2/persons/:id/project-assignments` domyka zakres projektów.
 *
 * Krok 1 robi `GeneralModal` przez `newUserRepository`; kroki 2 i 3 są tutaj, bo trasa
 * konta jest JEDYNĄ, która kolejkuje push do FIDmana, zakłada domyślne flagi roli
 * i unieważnia sesje po zmianie roli.
 */

export type NewUserSaveResult = {
    account: PersonAccountV2Payload | null;
    errors: string[];
};

/**
 * Domknięcie zapisu: konto, potem przypisania projektów.
 *
 * Zwraca błędy zamiast rzucać - wywołujący musi najpierw dopisać wiersz do listy (osoba
 * JEST już w bazie), a dopiero potem pokazać, czego nie zapisał. Rzucenie tutaj zostawiłoby
 * ekran bez nowego wiersza i z wrażeniem, że nic się nie stało.
 */
export async function saveNewUserAccountData(person: SystemUserData): Promise<NewUserSaveResult> {
    if (!person?.id) return { account: null, errors: [] };

    const errors: string[] = [];
    const v2Result = await savePersonV2AccountAndProfile(person.id, buildAccountPayload(person), {}, "StaffMembers");
    errors.push(...v2Result.errors);

    try {
        await saveProjectAssignments(person);
    } catch (error) {
        errors.push(`Przypisania projektów: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { account: v2Result.account, errors };
}

/**
 * Wiersz listy dla świeżo założonej osoby - czytany z serwera, nie składany z formularza.
 *
 * Powód: zapis konta z rolą 1/2/3/6/7 zakłada po drodze wiersz uprawnień z DOMYŚLNYMI
 * flagami roli (`StaffMemberRepository.ensureDefaultsForRole`), więc wiersz złożony
 * z formularza pokazywałby same zera i kłamał o stanie bazy.
 *
 * Osobne, tymczasowe repozytorium: `loadItemsFromServerPOST` podmienia `items` w całości,
 * więc odczyt na repozytorium listy skasowałby jej zawartość. `skipCache`, żeby jednoelementowy
 * wynik nie wylądował w sessionStorage pod cudzym kluczem.
 */
const newUserRowRepository = new RepositoryReact<StaffMemberData>({
    actionRoutes: {
        getRoute: "admin/staffMembers",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "staffMembers_newUserRow_temp",
});

export async function fetchStaffMemberRow(personId: number): Promise<StaffMemberData | null> {
    // scope „all": osoba bez e-maila systemowego i bez wiersza flag nie mieści się
    // w domyślnym zakresie listy, a i tak ma się pokazać po dodaniu.
    const rows = (await newUserRowRepository.loadItemsFromServerPOST([{ personId, scope: "all" }], undefined, {
        skipCache: true,
    })) as StaffMemberData[];
    return rows?.[0] ?? null;
}

/** Wstawia wiersz do listy okna: podmienia istniejący albo dokłada nowy. */
export function putRowIntoList(row: StaffMemberData): void {
    const isAlreadyThere = staffMembersRepository.items.some((item) => item.id === row.id);
    // Podmiana, nie drugi wiersz: po nieudanym domknięciu (np. zajęty e-mail systemowy)
    // modal zostaje otwarty, a ponowne „Zatwierdź" wchodzi tu drugi raz z tą samą osobą.
    if (isAlreadyThere) staffMembersRepository.replaceItemById(row.id, row);
    else staffMembersRepository.items.push(row);
    staffMembersRepository.currentItems = [row];
    staffMembersRepository.saveToSessionStorage();
}

/**
 * Handler `onAddNew`, wyciągnięty z komponentu, żeby dało się go testować.
 *
 * `createdPerson` to odpowiedź `POST /person` scalona z formularzem (`GeneralModal`),
 * więc niesie i numer nowej osoby, i pola konta, których serwer nie zapisał.
 */
export function makeUserAddNewHandler(onAddNew: ModalSaveCallback<StaffMemberData>) {
    return async function handleAddNew(createdPerson: SystemUserData) {
        const { errors } = await saveNewUserAccountData(createdPerson);

        // Odczyt wiersza jest częścią pokazania wyniku, nie zapisem - jego błąd nie może
        // przykryć błędu zapisu konta ani wywrócić modala. Bez wiersza lista po prostu
        // pokaże nową osobę po następnym „Szukaj”.
        let row: StaffMemberData | null = null;
        try {
            if (createdPerson?.id) row = await fetchStaffMemberRow(createdPerson.id);
        } catch (error) {
            console.warn("StaffMembers: nie udało się odczytać wiersza nowego użytkownika: %o", error);
        }
        if (row) putRowIntoList(row);

        // Lista czyta `repository.items`, więc argument callbacku jest tu tylko formalnością.
        onAddNew((row ?? (createdPerson as unknown as StaffMemberData)) as StaffMemberData);
        // Dopiero teraz błąd: modal zostaje otwarty i pokazuje, czego NIE zapisał.
        throwOnSaveErrors(errors);
    };
}

export function UserAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<StaffMemberData>) {
    return (
        <GeneralAddNewModalButton<SystemUserData>
            modalProps={{
                onAddNew: makeUserAddNewHandler(onAddNew),
                ModalBodyComponent: UserModalBody,
                modalTitle: "Dodaj użytkownika",
                repository: newUserRepository,
                makeValidationSchema: makeUserValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj użytkownika",
                buttonVariant: "outline-success",
            }}
        />
    );
}
