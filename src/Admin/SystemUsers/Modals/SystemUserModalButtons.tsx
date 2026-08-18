import React from "react";
import { PersonAccountV2Payload, SystemUserData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { systemUserRepository } from "../SystemUserController";
import { SystemUserModalBody } from "./SystemUserModalBody";
import { makeSystemUserValidationSchema } from "./SystemUserValidationSchema";
import {
    savePersonProjectAssignments,
    savePersonV2AccountAndProfile,
    throwOnSaveErrors,
} from "../../../Persons/personsV2Helpers";
import MainSetup from "../../../React/MainSetupReact";

/**
 * Zapisuje przypisania projektów po zapisaniu konta. Dla ról spoza zakresowych
 * (pracownik kontraktowy, klient) wysyła pustą listę - dzięki temu zmiana roli na inną
 * odbiera dostęp do projektów, zamiast zostawiać go po cichu w bazie.
 */
export async function saveProjectAssignments(person: SystemUserData) {
    if (!person?.id) return;

    if (!MainSetup.isProjectScopedRoleId(person.systemRoleId)) {
        await savePersonProjectAssignments(person.id, []);
        return;
    }

    const selected = (person as any)._projectAssignments;
    // Brak pola to NIE to samo co pusty wybór. Gdyby formularz go nie dowiózł,
    // pusta lista skasowałaby istniejące przypisania - a zapis, który po cichu
    // kasuje dane, jest gorszy niż zapis, który ich nie ruszy.
    if (!Array.isArray(selected)) return;

    await savePersonProjectAssignments(
        person.id,
        selected.map((project: { ourId: string }) => project.ourId)
    );
}

/**
 * Pola konta systemowego (PersonAccounts) wysyłane trasą v2. Dodanie i edycja wysyłają
 * dokładnie to samo - jedna funkcja zamiast dwóch kopii, które potrafią się rozjechać.
 *
 * PAYLOAD MUSI ZOSTAĆ PEŁNY - nie okrawać go "bo legacy i tak zapisze":
 * przy DODAWANIU legacy niczego nie zapisuje. `PersonsController.addFromDto` robi
 * `delete person.systemRoleId; delete person.systemEmail;` przed zapisem, więc
 * `POST /person` tworzy samą osobę, a konto zakłada WYŁĄCZNIE to wywołanie v2.
 * Bez roli i e-maila powstałoby konto, którym nie da się zalogować.
 *
 * Przy EDYCJI rolę i e-mail zapisuje dziś także legacy `PUT /person/:id`
 * (`DEFAULT_EDIT_FIELDS`) - to znany, przejściowy duplikat. Kierunek docelowy zgodny
 * z `@deprecated` w backendzie: legacy przestaje pisać konto (zawężenie `fieldsToUpdate`
 * w modalu edycji), a v2 przejmuje całość. NIE odwrotnie.
 *
 * `fidmanEnabled` zawsze jawnie, także przy false: brak pola serwer czyta jako
 * "nie ruszaj flagi", więc odznaczenie bez tej linii nigdy by nie doszło. Tę flagę
 * backend przyjmuje wyłącznie tą trasą (`ACCOUNT_FIELDS_WRITABLE_ONLY_VIA_ACCOUNT_ROUTE`),
 * bo tylko tu kolejkuje się push `user.upsert` do FIDmana.
 */
export function buildAccountPayload(person: SystemUserData): Partial<PersonAccountV2Payload> {
    return {
        systemRoleId: person.systemRoleId ? Number(person.systemRoleId) : undefined,
        systemEmail: person.systemEmail || undefined,
        fidmanEnabled: Boolean(person.fidmanEnabled),
    };
}

/**
 * Domknięcie zapisu użytkownika systemu: po udanym zapisie legacy (POST/PUT /person)
 * dopisujemy konto v2 i przypisania projektów.
 *
 * Zwraca listę błędów zamiast rzucać, bo wywołujący musi najpierw odświeżyć listę
 * danymi legacy (te zapisały się poprawnie), a dopiero potem pokazać błąd.
 */
export async function saveSystemUserAccountData(person: SystemUserData): Promise<string[]> {
    if (!person?.id) return [];

    const errors: string[] = [];
    const v2Result = await savePersonV2AccountAndProfile(person.id, buildAccountPayload(person), {}, "SystemUsers");
    errors.push(...v2Result.errors);

    try {
        await saveProjectAssignments(person);
    } catch (error) {
        errors.push(`Przypisania projektów: ${error instanceof Error ? error.message : String(error)}`);
    }

    return errors;
}

/**
 * Pola, ktore legacy `PUT /person/:id` ma zapisac przy edycji uzytkownika systemu.
 * To `PersonsController.DEFAULT_EDIT_FIELDS` MINUS pola konta (`systemRoleId`,
 * `systemEmail`): konto zapisuje wylacznie trasa v2, ktora jako jedyna kolejkuje push
 * do FIDmana, zaklada `StaffMembers` i uniewaznia sesje po zmianie roli. Bez tej listy
 * backend wraca do `DEFAULT_EDIT_FIELDS` i pisze konto rownolegle z v2.
 *
 * Lista MUSI zostac niepusta - `editFromDto` przy pustej tablicy takze wraca do
 * `DEFAULT_EDIT_FIELDS`, czyli legacy po cichu znowu zapisuje konto.
 *
 * `entityId` swiadomie poza lista: nie ma go dzis w `DEFAULT_EDIT_FIELDS`, wiec zmiana
 * podmiotu w modalu edycji i tak nie dziala. To osobny, starszy blad - dopisanie pola
 * tutaj zmienialoby zachowanie przy okazji, bez wlasnego testu.
 */
export const SYSTEM_USER_PERSON_EDIT_FIELDS = [
    "name",
    "surname",
    "position",
    "email",
    "cellphone",
    "phone",
    "comment",
];

export function SystemUserEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<SystemUserData>) {
    async function handleEdit(editedObject: SystemUserData) {
        // Po zapisie legacy, wyslij PUT v2 account + profile
        const errors = await saveSystemUserAccountData(editedObject);
        // Lista dostaje dane legacy niezależnie od wyniku domknięcia - one już są w bazie.
        onEdit(editedObject);
        // Dopiero teraz błąd: modal zostaje otwarty i pokazuje, czego NIE zapisał.
        throwOnSaveErrors(errors);
    }

    return (
        <GeneralEditModalButton<SystemUserData>
            modalProps={{
                onEdit: handleEdit,
                ModalBodyComponent: SystemUserModalBody,
                modalTitle: "Edycja danych osoby",
                repository: systemUserRepository,
                initialData: initialData,
                makeValidationSchema: makeSystemUserValidationSchema,
                fieldsToUpdate: SYSTEM_USER_PERSON_EDIT_FIELDS,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function SystemUserAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<SystemUserData>) {
    async function handleAddNew(newObject: SystemUserData) {
        // Po POST /person, wyslij PUT v2 account z danymi systemowymi
        const errors = await saveSystemUserAccountData(newObject);
        onAddNew(newObject);
        throwOnSaveErrors(errors);
    }

    return (
        <GeneralAddNewModalButton<SystemUserData>
            modalProps={{
                onAddNew: handleAddNew,
                ModalBodyComponent: SystemUserModalBody,
                modalTitle: "Dodaj użytkownika systemu",
                repository: systemUserRepository,
                makeValidationSchema: makeSystemUserValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj użytkownika",
                buttonVariant: "outline-success",
            }}
        />
    );
}
