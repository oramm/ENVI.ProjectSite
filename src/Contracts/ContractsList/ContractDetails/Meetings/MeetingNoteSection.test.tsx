import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContractMeetingNoteData } from "../../../../../Typings/bussinesTypes";
import MeetingNoteSection from "./MeetingNoteSection";

const hoisted = vi.hoisted(() => ({
    mockLoadItemsFromServerPOST: vi.fn(),
    meetingNotesRepositoryMock: {
        currentItems: [] as ContractMeetingNoteData[],
        loadItemsFromServerPOST: vi.fn(),
    },
}));

hoisted.meetingNotesRepositoryMock.loadItemsFromServerPOST = hoisted.mockLoadItemsFromServerPOST;

vi.mock("../../ContractsController", () => ({
    meetingNotesRepository: hoisted.meetingNotesRepositoryMock,
}));

vi.mock("../../../../View/Resultsets/CommonComponents", () => ({
    GDDocFileIconLink: () => <div data-testid="gd-doc-link" />,
    SpinnerBootstrap: () => <div data-testid="spinner" />,
    MenuExpandIconButton: ({ onClick }: { onClick: () => void }) => (
        <button onClick={onClick} type="button">
            menu
        </button>
    ),
}));

vi.mock("../MeetingNotes/Modals/MeetingNoteEditModalButton", () => ({
    MeetingNoteEditModalButton: () => <div data-testid="edit-note-button" />,
}));

vi.mock("../../../../View/Modals/GeneralModalButtons", () => ({
    GeneralDeleteModalButton: ({ modalProps }: { modalProps: { onDelete: () => void } }) => (
        <button onClick={modalProps.onDelete} type="button">
            delete
        </button>
    ),
}));

describe("MeetingNoteSection", () => {
    beforeEach(() => {
        hoisted.meetingNotesRepositoryMock.currentItems = [];
        hoisted.mockLoadItemsFromServerPOST.mockReset();
    });

    it("reports existing note state and keeps repository currentItems in sync", async () => {
        const noteStateSpy = vi.fn();
        hoisted.mockLoadItemsFromServerPOST.mockResolvedValue([
            {
                id: 7,
                contractId: 55,
                meetingId: 12,
                sequenceNumber: 1,
                title: "Notatka testowa",
                _documentOpenUrl: "https://docs.google.com/document/d/test",
            },
        ]);

        render(
            <MeetingNoteSection
                meetingId={12}
                onNoteStateChange={noteStateSpy}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Notatka testowa")).toBeInTheDocument();
        });

        expect(noteStateSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 7,
                meetingId: 12,
            })
        );
        // Read the repository back through the mocked module, exactly the way the component
        // reaches it. Since vitest 4.1 the hoisted factory object and the module export the
        // component imports are no longer guaranteed to be the same reference, so asserting on
        // the hoisted object alone gave a false negative while the write itself was fine.
        const { meetingNotesRepository } = await import("../../ContractsController");
        await waitFor(() => {
            expect(meetingNotesRepository.currentItems).toEqual([
                expect.objectContaining({ id: 7 }),
            ]);
        });
    });

    it("reports missing note state and clears UI after delete", async () => {
        const noteStateSpy = vi.fn();
        hoisted.mockLoadItemsFromServerPOST.mockResolvedValue([
            {
                id: 8,
                contractId: 55,
                meetingId: 15,
                sequenceNumber: 1,
                title: "Do usunięcia",
            },
        ]);

        render(
            <MeetingNoteSection
                meetingId={15}
                onNoteStateChange={noteStateSpy}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Do usunięcia")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: "menu" }));
        fireEvent.click(screen.getByRole("button", { name: "delete" }));

        await waitFor(() => {
            expect(screen.getByText("Brak notatki")).toBeInTheDocument();
        });

        expect(noteStateSpy).toHaveBeenLastCalledWith(null);
    });

    it("renders missing note state when repository returns no note", async () => {
        const noteStateSpy = vi.fn();
        hoisted.mockLoadItemsFromServerPOST.mockResolvedValue([]);

        render(
            <MeetingNoteSection
                meetingId={99}
                onNoteStateChange={noteStateSpy}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Brak notatki")).toBeInTheDocument();
        });

        expect(noteStateSpy).toHaveBeenCalledWith(null);
    });
});
