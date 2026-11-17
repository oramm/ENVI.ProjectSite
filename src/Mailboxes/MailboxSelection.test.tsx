import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { FormProvider } from "../View/Modals/FormContext";
import { MailboxSelection } from "./MailboxSelection";
import { ChatMembersSelector } from "../Contracts/ContractsList/Modals/ChatMembersSelector";

const mocks = vi.hoisted(() => ({ suggest: vi.fn(), fetchMailboxes: vi.fn() }));
vi.mock("./mailboxesService", () => ({ suggestMailboxAddress: mocks.suggest, fetchMailboxes: mocks.fetchMailboxes }));
vi.mock("../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({ PersonSelector: () => null }));
let form: UseFormReturn<FieldValues>;
function Harness({ contract = true }: { contract?: boolean }) {
    form = useForm<FieldValues>({ defaultValues: { ourId: "CHC.IK.01", _project: { ourId: "CHC.01" } } });
    return <FormProvider value={form}>
        <MailboxSelection contract={contract} />
        {contract && <ChatMembersSelector contract />}
    </FormProvider>;
}

describe("wybór skrzynki", () => {
    beforeEach(() => mocks.suggest.mockReset().mockResolvedValue({ address: "chc.01@envi.com.pl" }));
    it("domyślnie używa skrzynki projektu i pobiera propozycję z serwera", async () => {
        render(<Harness />);
        expect(screen.getByLabelText("Skrzynka projektu")).toBeChecked();
        expect(screen.getByLabelText("Adres skrzynki")).toHaveAttribute("readonly");
        await waitFor(() => expect(mocks.suggest).toHaveBeenCalledWith("CHC.01"));
        expect(form.getValues("_mailboxSelection")).toEqual({ mode: "project" });
        await waitFor(() => expect(screen.getByLabelText("Adres skrzynki")).toHaveValue("chc.01@envi.com.pl"));
    });
    it("projekt pozwala zmienić adres i zawsze ma skrzynkę", async () => {
        render(<Harness contract={false} />);
        fireEvent.change(screen.getByLabelText("Adres skrzynki"), { target: { value: "inny@envi.com.pl" } });
        expect(form.getValues("_mailboxSelection")).toEqual({ mode: "project", address: "inny@envi.com.pl" });
        expect(screen.queryByLabelText("Bez skrzynki")).toBeNull();
        expect(screen.queryByLabelText("Osobna skrzynka kontraktu")).toBeNull();
    });
    it("kontrakt pozwala zrezygnować ze skrzynki", () => {
        render(<Harness />);
        fireEvent.click(screen.getByLabelText("Bez skrzynki"));
        expect(form.getValues("_mailboxSelection")).toEqual({ mode: "none" });
        expect(screen.queryByLabelText("Adres skrzynki")).toBeNull();
    });
    it("dla istniejącej skrzynki projektu pokazuje jej faktyczny adres", async () => {
        mocks.fetchMailboxes.mockResolvedValue([{ address: "wlasny-adres@envi.com.pl" }]);
        render(<Harness />);
        act(() => form.setValue("_project", { id: 4, ourId: "CHC.01" }));
        await waitFor(() => expect(screen.getByLabelText("Adres skrzynki")).toHaveValue("wlasny-adres@envi.com.pl"));
        expect(mocks.fetchMailboxes).toHaveBeenCalledWith({ projectId: 4 });
    });
    it("osobna skrzynka kontraktu ma własny adres", async () => {
        render(<Harness />);
        fireEvent.click(screen.getByLabelText("Osobna skrzynka kontraktu"));
        await waitFor(() => expect(mocks.suggest).toHaveBeenCalledWith("CHC.IK.01"));
        fireEvent.change(screen.getByLabelText("Adres skrzynki"), { target: { value: "umowa@envi.com.pl" } });
        expect(form.getValues("_mailboxSelection")).toEqual({ mode: "separate", address: "umowa@envi.com.pl" });
    });
    it("dla umowy zewnętrznej wymaga wpisania adresu osobnej skrzynki", () => {
        render(<Harness />);
        act(() => form.setValue("_type", { isOur: false }));
        fireEvent.click(screen.getByLabelText("Osobna skrzynka kontraktu"));
        expect(screen.getByLabelText("Adres skrzynki")).toBeRequired();
        expect(screen.getByText("Ta umowa nie ma oznaczenia ENVI. Wpisz adres osobnej skrzynki.")).toBeInTheDocument();
    });
    it("przekazuje osoby przy kontrakcie także bez pokoju Chat", async () => {
        render(<Harness />);
        act(() => form.setValue("_chatSpacePersons", [{ id: 7 }, { id: 9 }]));
        await waitFor(() => expect(form.getValues("_selectedPersonIds")).toEqual([7, 9]));
        expect(form.getValues("_chatSpaceSelection")).toBeUndefined();
    });
});
