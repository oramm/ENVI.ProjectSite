import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FieldValues } from "react-hook-form";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { StaffMemberData } from "../../../Typings/bussinesTypes";
import { StaffMemberEditModalButton } from "./Modals/StaffMemberModalButtons";
import { UserAddNewModalButton } from "./Modals/UserModalButtons";
import { staffMembersRepository } from "./StaffMembersController";
import { StaffMembersFilterBody } from "./StaffMemberFilterBody";
import { BoolCell, Centered, TextCell } from "../adminTableCells";
import MainSetup from "../../React/MainSetupReact";
import { FidmanUserSyncBadge } from "./FidmanUserSyncBadge";

/** Nazwa roli systemowej po numerze - rola przychodzi z JOIN-a jako identyfikator. */
function roleNameById(systemRoleId: number | null | undefined): string {
    if (systemRoleId === null || systemRoleId === undefined) return "-";
    const entry = Object.entries(MainSetup.SystemRoles).find(
        ([, role]: [string, any]) => role.id === Number(systemRoleId),
    );
    return entry ? entry[0] : String(systemRoleId);
}

/** Klucz, pod którym FilterableTable pamięta kryteria tego okna (patrz FilterPanel). */
export const STAFF_MEMBERS_SNAPSHOT_KEY = "filtersableTableSnapshot_staffMembers";

/**
 * Pomost z okna „Osoby” (PER-4, przebudowany w PER-7 wg D-PER-9): zamiast ukrytego
 * warunku stałego i paska nad tabelą wskazana osoba wjeżdża JAWNIE do formularza filtra -
 * imię i nazwisko w „Szukana fraza”, zakres „Wszystkie osoby”. Nic ukrytego: stan widać
 * w polach, a „Wyczyść” wraca do domyślnej listy.
 *
 * `scope: "all"` jest konieczne: osoba bez e-maila systemowego i bez wiersza uprawnień
 * nie mieści się w węższych zakresach, a to właśnie jej najczęściej nadaje się uprawnienia
 * po raz pierwszy. Dwie osoby o tym samym imieniu i nazwisku pokażą się obie - świadomy
 * koszt, owner wolał to od paska.
 */
export type StaffMembersBridgeParams = {
    fraza: string | null;
    /** Numer roli systemowej osoby (PER-8) - filtr „Rola systemowa". */
    rola?: string | null;
    /** Numer i nazwa podmiotu osoby (PER-8) - filtr „Podmiot"; nazwa tylko do pokazania w polu. */
    podmiot?: string | null;
    podmiotNazwa?: string | null;
};

export function makeStaffMembersBridgeCriteria(params: StaffMembersBridgeParams): FieldValues | null {
    const phrase = (params.fraza ?? "").trim();
    if (!phrase) return null;
    // Rola i podmiot jawnie puste, gdy ich nie ma - zasiew nadpisuje migawkę w całości,
    // więc stare wartości i tak znikają; puste pola mówią o tym wprost.
    const criteria: FieldValues = { searchText: phrase, scope: "all", systemRoleId: "", _entities: [] };
    const roleId = Number(params.rola);
    if (params.rola && Number.isInteger(roleId) && roleId > 0) criteria.systemRoleId = String(roleId);
    const entityId = Number(params.podmiot);
    if (params.podmiot && Number.isInteger(entityId) && entityId > 0)
        criteria._entities = [{ id: entityId, name: params.podmiotNazwa ?? "" }];
    return criteria;
}

/**
 * Zasiew kryteriów PRZED zamontowaniem tabeli. Pierwotny pomost nakładał osobę na
 * ZAPAMIĘTANE wyszukiwanie (fraza „test” z poprzedniej wizyty + inna osoba = 0 wierszy,
 * owner to zobaczył), bo FilterPanel odtwarza kryteria z sessionStorage przy montowaniu.
 * Nadpisanie migawki w całości kasuje tamto wyszukiwanie i podstawia nowe, zanim panel
 * je odczyta. Zwraca true, gdy zasiew nastąpił.
 */
export function seedStaffMembersFilter(params: StaffMembersBridgeParams, storage: Storage = sessionStorage): boolean {
    const criteria = makeStaffMembersBridgeCriteria(params);
    if (!criteria) return false;
    storage.setItem(STAFF_MEMBERS_SNAPSHOT_KEY, JSON.stringify({ criteria }));
    return true;
}

/**
 * Konta i uprawnienia osób - jedyne okno do zarządzania użytkownikami (PER-3).
 *
 * Lista idzie OD osób, nie od tabeli uprawnień - osoba bez nadanych uprawnień też
 * musi być widoczna, inaczej nie dałoby się jej niczego nadać. Zakres wybiera się
 * w filtrze (D-PER-7): domyślnie osoby z nadanymi uprawnieniami, dalej „z kontem”
 * (e-mail systemowy albo uprawnienia), na końcu cała książka adresowa.
 *
 * Przycisk dodawania zakłada osobę RAZEM z kontem - przejął to po skasowanym ekranie
 * „Dodawanie użytkowników". Usuwania nie ma i mieć nie będzie: wiersz to człowiek,
 * a odejście z firmy to wyłączenie flagi „Aktywny", nie skasowanie wiersza. Osoby kasuje
 * się w oknie „Osoby".
 */
export default function StaffMembersSearch({ title }: { title: string }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const frazaParam = searchParams.get("fraza");
    const bridgeParams: StaffMembersBridgeParams = {
        fraza: frazaParam,
        rola: searchParams.get("rola"),
        podmiot: searchParams.get("podmiot"),
        podmiotNazwa: searchParams.get("podmiotNazwa"),
    };

    // Zasiew w trakcie renderu, nie w efekcie: FilterPanel czyta migawkę przy montowaniu,
    // a efekty dzieci biegną przed efektami rodzica - zasiew w useEffect byłby za późno
    // i pierwsze wyszukanie poszłoby ze starymi kryteriami. Ref, żeby zasiać raz na montaż.
    const seeded = useRef(false);
    if (!seeded.current) {
        seeded.current = true;
        seedStaffMembersFilter(bridgeParams);
    }

    useEffect(() => {
        document.title = title;
    }, [title]);

    // Parametr zrobił swoje i znika z adresu, żeby odświeżenie strony nie wracało do
    // wskazanej osoby po raz drugi, a zakładka z gołym adresem działała jak zwykle.
    useEffect(() => {
        if (frazaParam !== null) setSearchParams({}, { replace: true });
    }, [frazaParam, setSearchParams]);

    return (
        <>
            <FilterableTable<StaffMemberData>
                id="staffMembers"
                title={title}
                FilterBodyComponent={StaffMembersFilterBody}
                tableStructure={[
                    {
                        // Druga linia to e-mail SYSTEMOWY (logowanie), nie kontaktowy - to okno
                        // odpowiada na pytanie „co osoba może w systemie". Plakietka FIDmana
                        // i podmiot mieszkają w tej samej komórce: tabela trzyma 11 kolumn
                        // siatki, dwunasta jest menu akcji wiersza (lekcja packa PIS), więc
                        // bez nowych kolumn. Podmiot doszedł w PER-3 razem z filtrem podmiotu -
                        // bez niego nie dałoby się wzrokiem sprawdzić, co filtr wybrał.
                        header: "Osoba",
                        renderTdBody: (person: StaffMemberData) => (
                            <Centered>
                                <div>
                                    {person._personName} {person._personSurname}
                                    <FidmanUserSyncBadge
                                        enabled={!!person._fidmanEnabled}
                                        sync={person._fidmanSync}
                                        className="ms-2 align-middle"
                                    />
                                </div>
                                <div className="text-muted small">
                                    {person._systemEmail || <span className="fst-italic">bez e-maila systemowego</span>}
                                </div>
                                {person._entityName && <div className="text-muted small">{person._entityName}</div>}
                            </Centered>
                        ),
                        colMd: 3,
                    },
                    {
                        header: "Rola",
                        renderTdBody: (person: StaffMemberData) => (
                            <Centered>
                                <span className="small">{roleNameById(person._systemRoleId)}</span>
                            </Centered>
                        ),
                        colMd: 2,
                    },
                    {
                        header: "Kierowca",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.isDriver} />,
                        colMd: 1,
                    },
                    {
                        header: "Scrum",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.isInScrum} />,
                        colMd: 1,
                    },
                    {
                        header: "Faktury kosztowe",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.hasCostInvoiceAccess} />,
                        colMd: 1,
                    },
                    {
                        header: "Bank",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.hasBankAccess} />,
                        colMd: 1,
                    },
                    {
                        header: "Wizyty",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.canLogSiteVisits} />,
                        colMd: 1,
                    },
                    {
                        header: "Aktywny",
                        renderTdBody: (person: StaffMemberData) => <BoolCell value={person.isActive} />,
                        colMd: 1,
                    },
                ]}
                AddNewButtonComponents={[UserAddNewModalButton]}
                EditButtonComponent={StaffMemberEditModalButton}
                isDeletable={false}
                repository={staffMembersRepository}
                searchOnMount={true}
            />
        </>
    );
}
