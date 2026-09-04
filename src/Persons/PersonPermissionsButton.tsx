import React from "react";
import { useNavigate } from "react-router-dom";
import { PersonData } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import { PermissionsIconButton } from "../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../View/Resultsets/FilterableTable/FilterableTableTypes";

/**
 * Adres okna uprawnień z osobą wpisaną do filtra (D-PER-9, 2026-09-04).
 *
 * Jedzie imię i nazwisko, nie numer osoby: okno uprawnień wpisuje je w „Szukana fraza”
 * i szuka w zakresie „Wszystkie osoby”, więc stan jest widoczny w formularzu, a „Wyczyść”
 * działa jak zwykle. Numer w adresie (PER-4) wymagał ukrytego warunku stałego i paska
 * nad tabelą, a nakładał się na zapamiętane wyszukiwanie - owner widział 0 wierszy.
 * Parametr w zapytaniu, nie w ścieżce, bo okno zostaje listą, a „wstecz” wraca do Osób.
 */
export type PersonBridgeSource = {
    name?: string | null;
    surname?: string | null;
    systemRoleId?: number | string | null;
    _entity?: { id?: number; name?: string } | null;
};

export function buildPersonPermissionsPath(person: PersonBridgeSource): string {
    const params = new URLSearchParams();
    params.set("fraza", `${person.name ?? ""} ${person.surname ?? ""}`.trim());
    // Rola i podmiot (uwaga ownera 2026-09-04, PER-8): imiennicy różnią się zwykle podmiotem,
    // a fraza łapie też nazwiska zawierające imię (Adam → Adamczyk). Obie listy czytają rolę
    // z tego samego źródła (konto, z zapasem na zaszłą kolumnę), więc filtr trafia w tę samą osobę.
    const roleId = Number(person.systemRoleId);
    if (person.systemRoleId !== undefined && person.systemRoleId !== null && Number.isInteger(roleId) && roleId > 0)
        params.set("rola", String(roleId));
    const entityId = Number(person._entity?.id);
    if (Number.isInteger(entityId) && entityId > 0) {
        params.set("podmiot", String(entityId));
        if (person._entity?.name) params.set("podmiotNazwa", person._entity.name);
    }
    return `/admin/staffMembers?${params.toString()}`;
}

/**
 * Pomost z książki adresowej do kont i uprawnień tej samej osoby (PER-4).
 *
 * Dwa okna zostają — „Osoby” odpowiadają na pytanie kto to jest, „Personel i uprawnienia”
 * na pytanie co może w systemie — ale administrator nie musi szukać człowieka drugi raz.
 *
 * Akcja widoczna tylko dla ról panelu administracyjnego: okno docelowe stoi na tej samej
 * stałej, a serwer bramkuje trasy konta rolami ADMIN i ENVI_MANAGER. Pokazanie jej
 * pracownikowi ENVI dałoby ikonę prowadzącą w pustą trasę.
 */
export function PersonPermissionsButton({ dataObject, layout }: RowActionMenuItemProps<PersonData>) {
    const navigate = useNavigate();

    if (!MainSetup.isRoleAllowed(MainSetup.ADMIN_PANEL_ROLES)) return null;

    return (
        <span title="Uprawnienia">
            <PermissionsIconButton layout={layout} onClick={() => navigate(buildPersonPermissionsPath(dataObject))} />
        </span>
    );
}
