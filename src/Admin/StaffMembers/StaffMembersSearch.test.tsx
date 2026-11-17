import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { StaffMemberData } from "../../../Typings/bussinesTypes";
import StaffMembersSearch from "./StaffMembersSearch";

const row = vi.hoisted(() => ({ _finEnabled: undefined as boolean | undefined, _systemRoleId: 3 }));

vi.mock("../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: ({ tableStructure }: {
        tableStructure: { header: string; renderTdBody: (person: Partial<StaffMemberData>) => React.ReactNode }[];
    }) => <>{tableStructure.map(column => <span key={column.header}>{column.header}</span>)}{tableStructure[0].renderTdBody(row)}{tableStructure[1].renderTdBody(row)}</>,
    TableTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock("./Modals/StaffMemberModalButtons", () => ({ StaffMemberEditModalButton: () => null }));
vi.mock("./Modals/UserModalButtons", () => ({ UserAddNewModalButton: () => null }));
vi.mock("./StaffMembersController", () => ({ staffMembersRepository: {} }));
vi.mock("./StaffMemberFilterBody", () => ({ StaffMembersFilterBody: () => null }));

describe("StaffMembersSearch - dostęp FIN z wiersza listy", () => {
    it.each([true, false, undefined])("pokazuje stan FIN (%s) bez statusu wysyłki", (enabled) => {
        row._finEnabled = enabled;
        render(
            <MemoryRouter>
                <StaffMembersSearch title="Uprawnienia" />
            </MemoryRouter>,
        );
        expect(screen.getByTestId("fin-access-badge")).toHaveTextContent(enabled ? "FIN: włączony" : "FIN: wyłączony");
        expect(screen.queryByText(/FIN:.*(wysłano|oczekuje|błąd)/)).not.toBeInTheDocument();
        expect(screen.getByText("Pracownik ENVI")).toBeInTheDocument();
        expect(screen.getByText("Finanse firmy")).toBeInTheDocument();
        expect(screen.queryByText("ENVI_EMPLOYEE")).not.toBeInTheDocument();
    });
});
