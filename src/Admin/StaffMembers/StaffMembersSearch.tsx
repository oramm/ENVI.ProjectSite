import React, { useEffect } from "react";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { StaffMemberData } from "../../../Typings/bussinesTypes";
import { StaffMemberEditModalButton } from "./Modals/StaffMemberModalButtons";
import { staffMembersRepository } from "./StaffMembersController";
import { StaffMembersFilterBody } from "./StaffMemberFilterBody";
import { BoolCell, Centered, TextCell } from "../adminTableCells";
import MainSetup from "../../React/MainSetupReact";

/** Nazwa roli systemowej po numerze - rola przychodzi z JOIN-a jako identyfikator. */
function roleNameById(systemRoleId: number | null | undefined): string {
    if (systemRoleId === null || systemRoleId === undefined) return "-";
    const entry = Object.entries(MainSetup.SystemRoles).find(
        ([, role]: [string, any]) => role.id === Number(systemRoleId),
    );
    return entry ? entry[0] : String(systemRoleId);
}

/**
 * Uprawnienia funkcyjne personelu.
 *
 * Lista idzie OD osób, nie od tabeli uprawnień - osoba bez nadanych uprawnień też
 * musi być widoczna, inaczej nie dałoby się jej niczego nadać.
 *
 * Bez przycisku dodawania i bez usuwania: wiersz to osoba, a nie rekord słownikowy.
 * Odejście z firmy to wyłączenie flagi „Aktywny”, nie skasowanie wiersza.
 */
export default function StaffMembersSearch({ title }: { title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <FilterableTable<StaffMemberData>
                id="staffMembers"
                title={title}
                FilterBodyComponent={StaffMembersFilterBody}
                tableStructure={[
                    {
                        header: "Osoba",
                        renderTdBody: (person: StaffMemberData) => (
                            <Centered>
                                <div>
                                    {person._personName} {person._personSurname}
                                </div>
                                <div className="text-muted small">{person._personEmail}</div>
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
                AddNewButtonComponents={[]}
                EditButtonComponent={StaffMemberEditModalButton}
                isDeletable={false}
                repository={staffMembersRepository}
                searchOnMount={true}
        />
    );
}
