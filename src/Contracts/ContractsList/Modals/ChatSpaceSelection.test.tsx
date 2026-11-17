import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FieldValues, UseFormReturn, useForm } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { ChatSpaceSelection } from "./ChatSpaceSelection";

const hoisted = vi.hoisted(() => ({ fetchChatSpacesForProject: vi.fn() }));

vi.mock("./chatSpacesService", async (importOriginal) => ({
    ...(await importOriginal<typeof import("./chatSpacesService")>()),
    fetchChatSpacesForProject: hoisted.fetchChatSpacesForProject,
}));

let form: UseFormReturn<FieldValues>;

function Harness() {
    form = useForm<FieldValues>({ defaultValues: { _project: { ourId: "P.1", name: "Projekt" } } });
    return (
        <FormProvider value={form}>
            <ChatSpaceSelection />
        </FormProvider>
    );
}

const existingRadio = () => document.getElementById("chatSpaceMode-existing");
const SPACE = { id: 5, displayName: "Pokój" };

describe("ChatSpaceSelection: opcja Istniejący pokój", () => {
    it("przekazuje wybrane osoby przy rejestracji i zachowuje je po zmianie nazwy pokoju", async () => {
        hoisted.fetchChatSpacesForProject.mockResolvedValue([]);
        render(<Harness />);
        act(() => document.getElementById("chatSpaceMode-new")!.click());
        act(() => form.setValue("_chatSpacePersons", [{ id: 11 }, { id: 12 }]));
        await waitFor(() => expect(form.getValues("_chatSpaceSelection").personIds).toEqual([11,12]));
        act(() => form.setValue("_chatSpaceSelection", {mode:"new", scope:"project", displayName:"Nowy"}));
        await waitFor(() => expect(form.getValues("_chatSpaceSelection")).toMatchObject({scope:"project",displayName:"Nowy",personIds:[11,12]}));
    });
    it("jest ukryta przy pustej liście", async () => {
        hoisted.fetchChatSpacesForProject.mockResolvedValue([]);
        render(<Harness />);
        await waitFor(() => expect(hoisted.fetchChatSpacesForProject).toHaveBeenCalled());
        expect(existingRadio()).toBeNull();
    });

    it("przy niepustej liście jest widoczna, a gdy projekt zostanie wyczyszczony, wybór wraca na Bez pokoju", async () => {
        hoisted.fetchChatSpacesForProject.mockResolvedValue([SPACE]);
        render(<Harness />);
        await waitFor(() => expect(existingRadio()).not.toBeNull());

        act(() => existingRadio()!.click());
        await waitFor(() => expect(form.getValues("_chatSpaceSelection")).toEqual({ mode: "existing", chatSpaceId: 5 }));

        act(() => form.setValue("_project", undefined));
        await waitFor(() => expect(form.getValues("_chatSpaceSelection")).toEqual({ mode: "none" }));
        expect(existingRadio()).toBeNull();
    });
});
