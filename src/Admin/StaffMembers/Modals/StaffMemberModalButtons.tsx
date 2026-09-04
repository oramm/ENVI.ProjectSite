import React from "react";
import { PersonAccountV2Payload, StaffMemberData } from "../../../../Typings/bussinesTypes";
import { GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { ModalSaveCallback, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import {
    AccountFormValues,
    buildAccountPayload,
    saveProjectAssignments,
    savePersonV2AccountAndProfile,
    throwOnSaveErrors,
} from "../../../Persons/personsV2Helpers";
import { staffMembersRepository } from "../StaffMembersController";
import { StaffMemberModalBody } from "./StaffMemberModalBody";
import { fetchStaffMemberRow } from "./UserModalButtons";
import { makeStaffMemberValidationSchema } from "./StaffMemberValidationSchema";

/** Wartości formularza uprawnień, które NIE są flagami - idą osobnymi żądaniami po zapisie flag. */
export type StaffMemberAccountFormValues = AccountFormValues & { _projectAssignments?: unknown };

export type StaffMemberAccountSaveResult = {
    account: PersonAccountV2Payload | null;
    errors: string[];
    /** D-PER-10: zapis dotyczył własnej roli - sesja skasowana, dalsze żądania poszłyby w 401. */
    selfSessionRevoked?: boolean;
};

/**
 * Wylogowanie po zmianie WŁASNEJ roli (D-PER-10, 2026-09-04). Serwer skasował sesję
 * wołającego, żeby nowa rola obowiązywała od razu; bez tego kroku człowiek dostawał raport
 * błędu serwera i przy następnym kliknięciu lądował na ekranie logowania bez słowa wyjaśnienia.
 *
 * `alert`, nie toast: blokuje stronę do kliknięcia, więc żadne równoległe żądanie nie zdąży
 * dostać 401 i przeładować strony, zanim człowiek przeczyta, co się stało. Zależności są
 * podmienne, żeby test nie przeładowywał strony testowej.
 */
export const ownRoleChangeLogout = {
    notify: (message: string) => window.alert(message),
    reload: () => window.location.reload(),
};

export const OWN_ROLE_CHANGE_MESSAGE =
    "Zmieniłeś własną rolę systemową. Nowe uprawnienia zaczną obowiązywać po ponownym zalogowaniu - za chwilę zobaczysz ekran logowania.";

export function logoutAfterOwnRoleChange(): void {
    ownRoleChangeLogout.notify(OWN_ROLE_CHANGE_MESSAGE);
    window.sessionStorage.clear();
    ownRoleChangeLogout.reload();
}

/**
 * Domknięcie zapisu z panelu uprawnień. Woła się PO zapisie flag (PUT /admin/staffMember):
 * 1. konto trasą v2 (rola, e-mail systemowy, FIDman - flaga zawsze jawnie, także false),
 * 2. przypisania projektów.
 *
 * Kolejność „flagi, potem konto" jest celowa: zmiana roli trasą v2 zakłada domyślne
 * flagi dla roli (INSERT IGNORE). Gdy wiersz flag już stoi, nic nie nadpisuje.
 *
 * To ta sama trasa konta, której używa ekran użytkowników - jedyna, która unieważnia
 * sesje po zmianie roli i kolejkuje push `user.upsert` do FIDmana. Panel nie pisze roli
 * własną drogą (PER-1). Zwraca błędy zamiast rzucać: lista musi najpierw dostać zapisane
 * flagi, a dopiero potem modal pokazuje, czego NIE zapisał.
 */
export async function saveStaffMemberAccountData(
    personId: number,
    values: StaffMemberAccountFormValues,
): Promise<StaffMemberAccountSaveResult> {
    const errors: string[] = [];
    const v2Result = await savePersonV2AccountAndProfile(personId, buildAccountPayload(values), {}, "StaffMembers");
    errors.push(...v2Result.errors);

    // D-PER-10: zapis WŁASNEJ roli - serwer skasował sesję wołającego. Przypisania projektów
    // poszłyby już w 401 (i przeładowały stronę bez słowa wyjaśnienia), więc tu kończymy;
    // komunikat i wylogowanie robi handler.
    if (v2Result.account?._selfSessionRevoked) {
        return { account: v2Result.account, errors, selfSessionRevoked: true };
    }

    try {
        await saveProjectAssignments({
            id: personId,
            systemRoleId: values.systemRoleId,
            _projectAssignments: values._projectAssignments,
        });
    } catch (error) {
        errors.push(`Przypisania projektów: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { account: v2Result.account, errors };
}

/**
 * Wiersz listy po domknięciu: odpowiedź na zapis flag niesie konto sprzed zapisu konta,
 * więc rolę, e-mail i FIDmana bierzemy z odpowiedzi trasy v2. Bez konta (zapis konta
 * padł) wiersz zostaje taki, jaki jest - to prawdziwy stan bazy.
 */
export function mergeAccountIntoRow(row: StaffMemberData, account: PersonAccountV2Payload | null): StaffMemberData {
    if (!account) return row;
    return {
        ...row,
        _systemRoleId: account.systemRoleId ?? null,
        _systemEmail: account.systemEmail ?? null,
        _fidmanEnabled: !!account.fidmanEnabled,
    };
}

/**
 * Handler `onEdit` modalu uprawnień, wyciągnięty z komponentu, żeby dało się go testować.
 *
 * `submitted` (drugi argument z GeneralModal) to wiersz scalony z formularzem - stąd
 * rola, e-mail systemowy, FIDman i projekty. `editedObject` to odpowiedź serwera na
 * zapis flag: świeży odczyt wiersza, który tych pól NIE odbija. Bez `submitted`
 * nie ma czego zapisać, a wysłanie domyślnych wartości wyłączyłoby komuś FIDmana.
 */
export function makeStaffMemberEditHandler(onEdit: ModalSaveCallback<StaffMemberData>) {
    return async function handleEdit(editedObject: StaffMemberData, submitted?: StaffMemberData) {
        const personId = editedObject.personId ?? editedObject.id;
        if (!submitted || !personId) {
            onEdit(editedObject);
            throw new Error("Flagi zapisano, ale konto NIE: formularz nie przekazał wartości konta.");
        }

        const { account, errors, selfSessionRevoked } = await saveStaffMemberAccountData(
            personId,
            submitted as StaffMemberData & StaffMemberAccountFormValues,
        );

        if (selfSessionRevoked) {
            // Bez odczytu wiersza z serwera (poszedłby w 401) i bez rzucania: to nie jest
            // błąd, tylko koniec sesji. Okno się zamyka, lista dostaje wiersz scalony
            // z odpowiedzią i zaraz znika razem z sesją.
            onEdit(mergeAccountIntoRow(editedObject, account));
            logoutAfterOwnRoleChange();
            return;
        }

        // Świeży odczyt wiersza z serwera zamiast scalania odpowiedzi: po zapisie konta serwer
        // od razu próbuje wysłać je do FIDmana (dostawa po commicie, PRZED odpowiedzią), więc
        // dopiero odczyt listy niesie stan tej wysyłki (D-PER-8). Odczyt nie jest zapisem -
        // jego błąd nie może przykryć błędu zapisu konta; wtedy scalamy jak dawniej.
        const fresh = await fetchStaffMemberRow(personId).catch(() => null);
        // Lista czyta repository.items, nie argument callbacku - wiersz podmieniamy
        // w repozytorium, inaczej pokazałaby konto sprzed zapisu.
        const row = fresh ?? mergeAccountIntoRow(editedObject, account);
        if (row !== editedObject && row.id !== undefined) {
            staffMembersRepository.replaceItemById(row.id, row);
            staffMembersRepository.replaceCurrentItemById(row.id, row);
            staffMembersRepository.saveToSessionStorage();
        }
        onEdit(row);
        // Dopiero teraz błąd: modal zostaje otwarty i pokazuje, czego NIE zapisał.
        // „Uprawnienia", nie „Dane osoby": to, co zapisał pierwszy PUT, to flagi.
        throwOnSaveErrors(errors, "Uprawnienia");
    };
}

/**
 * Tylko edycja. Nie ma przycisku dodawania, bo panel nie zakłada ludzi -
 * uprawnienia przypina się do osób już istniejących w systemie.
 */
export function StaffMemberEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<StaffMemberData>) {
    return (
        <GeneralEditModalButton<StaffMemberData>
            modalProps={{
                onEdit: makeStaffMemberEditHandler(onEdit),
                ModalBodyComponent: StaffMemberModalBody,
                modalTitle: "Uprawnienia osoby",
                repository: staffMembersRepository,
                initialData: initialData,
                makeValidationSchema: makeStaffMemberValidationSchema,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}
