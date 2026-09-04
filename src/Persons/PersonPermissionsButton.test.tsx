import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PersonData } from "../../Typings/bussinesTypes";
import { buildPersonPermissionsPath, PersonPermissionsButton } from "./PersonPermissionsButton";

/**
 * Pomost z okna „Osoby” do kont i uprawnień (PER-4).
 *
 * Widoczność akcji stoi na `MainSetup.ADMIN_PANEL_ROLES`, a ta odczytuje rolę
 * z sessionStorage — dlatego test ustawia użytkownika, zamiast mockować MainSetup.
 * Okno docelowe jest za `ProtectedRoute` na tej samej stałej, więc pokazanie ikony
 * pracownikowi ENVI dałoby przejście donikąd.
 */
function setCurrentUserRole(systemRoleName: string) {
    sessionStorage.setItem("Current User", JSON.stringify({ systemRoleName, userName: "Testowy Użytkownik" }));
}

const person = {
    id: 618,
    name: "Jan",
    surname: "Kowalski",
    systemRoleId: "3",
    _entity: { id: 1, name: "ENVI" },
} as unknown as PersonData;

function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderButton() {
    return render(
        <MemoryRouter initialEntries={["/persons"]}>
            <Routes>
                <Route path="/persons" element={<PersonPermissionsButton dataObject={person} layout="vertical" />} />
                <Route path="/admin/staffMembers" element={<LocationProbe />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe("PersonPermissionsButton — akcja „Uprawnienia” w oknie Osoby", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it("ADMIN widzi akcję", () => {
        setCurrentUserRole("ADMIN");
        renderButton();
        expect(screen.getByTitle("Uprawnienia")).toBeInTheDocument();
    });

    it("ENVI_MANAGER widzi akcję", () => {
        setCurrentUserRole("ENVI_MANAGER");
        renderButton();
        expect(screen.getByTitle("Uprawnienia")).toBeInTheDocument();
    });

    it("ENVI_EMPLOYEE nie widzi akcji", () => {
        setCurrentUserRole("ENVI_EMPLOYEE");
        renderButton();
        expect(screen.queryByTitle("Uprawnienia")).not.toBeInTheDocument();
    });

    it("bez zalogowanego użytkownika akcji nie ma", () => {
        renderButton();
        expect(screen.queryByTitle("Uprawnienia")).not.toBeInTheDocument();
    });

    it("klik prowadzi do okna uprawnień z tą osobą wpisaną do filtra", async () => {
        setCurrentUserRole("ADMIN");
        renderButton();

        // Klikany jest element wewnętrzny: `title` niesie kontener, a `onClick` siedzi
        // na ikonie w środku — zdarzenie z kontenera nie zeszłoby do niej w dół.
        fireEvent.click(screen.getByTitle("Uprawnienia").firstElementChild as Element);

        expect(await screen.findByTestId("location")).toHaveTextContent(
            "/admin/staffMembers?fraza=Jan+Kowalski&rola=3&podmiot=1&podmiotNazwa=ENVI",
        );
    });

    it("adres niesie frazę, rolę i podmiot osoby (D-PER-9, PER-8)", () => {
        expect(buildPersonPermissionsPath(person)).toBe(
            "/admin/staffMembers?fraza=Jan+Kowalski&rola=3&podmiot=1&podmiotNazwa=ENVI",
        );
    });

    it("bez roli i podmiotu zostaje sama fraza; brak imienia nie zostawia spacji na początku", () => {
        expect(buildPersonPermissionsPath({ name: "", surname: "Kowalski" })).toBe("/admin/staffMembers?fraza=Kowalski");
        expect(buildPersonPermissionsPath({ name: "Jan", surname: "Kowalski", systemRoleId: null, _entity: null })).toBe(
            "/admin/staffMembers?fraza=Jan+Kowalski",
        );
    });
});
