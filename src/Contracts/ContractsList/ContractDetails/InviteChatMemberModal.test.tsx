import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OurContract } from "../../../../Typings/bussinesTypes";
import { InviteChatMemberModal } from "./ContractChatSpaceSection";
import { inviteContractChatMembers } from "../Modals/chatSpacesService";

vi.mock("../Modals/chatSpacesService", async (original) => ({
    ...await original<typeof import("../Modals/chatSpacesService")>(), inviteContractChatMembers: vi.fn(),
}));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", async () => {
    const { useFormContext } = await import("../../../View/Modals/FormContext");
    return { PersonSelector: ({name, multiple}: {name:string;multiple:boolean}) => {
        const methods = useFormContext();
        return <button type="button" onClick={() => methods.setValue(name, [{id:11}, {id:12}])}>
            {multiple ? "Wybierz dwie osoby" : "BŁĄD: pojedynczy wybór"}
        </button>;
    }};
});

describe("zaproszenia z listy osob", () => {
    beforeEach(() => vi.clearAllMocks());
    const contract = { id: 100 } as OurContract;

    function selectPersons() {
        render(<InviteChatMemberModal contract={contract} onClose={() => {}} />);
        expect(screen.getByRole("button", {name:"Wyślij zaproszenia"})).toBeDisabled();
        fireEvent.click(screen.getByRole("button", {name:"Wybierz dwie osoby"}));
        fireEvent.click(screen.getByRole("button", {name:"Wyślij zaproszenia"}));
    }

    it("wysyla tylko identyfikatory osob i pokazuje wyniki dla kazdej", async () => {
        vi.mocked(inviteContractChatMembers).mockResolvedValue({members:[
            {personId:11,displayName:"Anna Testowa",email:"anna@gmail.com",state:"INVITED"},
            {personId:12,displayName:"Jan Testowy",email:"jan@gmail.com",state:"JOINED"},
        ]});
        selectPersons();
        await screen.findByText(/Anna Testowa: zaproszenie wysłane/);
        await screen.findByText(/Jan Testowy: dodano do pokoju/);
        expect(inviteContractChatMembers).toHaveBeenCalledWith(100,[11,12]);
    });

    it("pokazuje blad i pozwala ponowic", async () => {
        vi.mocked(inviteContractChatMembers).mockRejectedValue(new Error("Nie należysz do pokoju"));
        selectPersons();
        await screen.findByText("Nie należysz do pokoju");
        await waitFor(() => expect(screen.getByRole("button", {name:"Wyślij zaproszenia"})).toBeEnabled());
    });

    it("nie ukrywa braku konta Google wybranej osoby", async () => {
        vi.mocked(inviteContractChatMembers).mockResolvedValue({members:[
            {personId:11,displayName:"Anna Testowa",email:"",state:"FAILED",error:"Brak aktywnego konta Google w PS."},
        ]});
        selectPersons();
        await screen.findByText(/Anna Testowa: nie udało się dodać: Brak aktywnego konta Google/);
        expect(screen.queryByText(/zaproszenie wysłane/)).not.toBeInTheDocument();
    });
});
