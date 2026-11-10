import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { StaffMemberData } from "../../../Typings/bussinesTypes";
import StaffMembersSearch from "./StaffMembersSearch";

const row = vi.hoisted(() => ({ _finEnabled: undefined as boolean | undefined }));

vi.mock("../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: ({ tableStructure }: {
        tableStructure: { renderTdBody: (person: Partial<StaffMemberData>) => React.ReactNode }[];
    }) => <>{tableStructure[0].renderTdBody(row)}</>,
}));
vi.mock("./Modals/StaffMemberModalButtons", () => ({ StaffMemberEditModalButton: () => null }));
vi.mock("./Modals/UserModalButtons", () => ({ UserAddNewModalButton: () => null }));
vi.mock("./StaffMembersController", () => ({ staffMembersRepository: {} }));
vi.mock("./StaffMemberFilterBody", () => ({ StaffMembersFilterBody: () => null }));
vi.mock("../../React/MainSetupReact", () => ({ default: { SystemRoles: {} } }));

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
    });
});
