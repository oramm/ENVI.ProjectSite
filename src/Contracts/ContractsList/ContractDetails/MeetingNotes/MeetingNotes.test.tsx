import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContractMeetingNoteData } from "../../../../../Typings/bussinesTypes";
import MeetingNotes from "./MeetingNotes";

const hoisted = vi.hoisted(() => ({
    mockLoadItemsFromServerPOST: vi.fn(),
    meetingNotesRepositoryMock: {
        items: [] as ContractMeetingNoteData[],
        loadItemsFromServerPOST: vi.fn(),
    },
    capturedFilterableTableProps: null as any,
}));

hoisted.meetingNotesRepositoryMock.loadItemsFromServerPOST = hoisted.mockLoadItemsFromServerPOST;

vi.mock("../../ContractsController", () => ({
    meetingNotesRepository: hoisted.meetingNotesRepositoryMock,
}));

vi.mock("../ContractDetailsContext", () => ({
    useContractDetails: () => ({
        contract: { id: 123 },
    }),
}));

vi.mock("./Modals/MeetingNoteModalButtons", () => ({
    MeetingNoteAddNewModalButton: () => null,
}));

vi.mock("../../../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: (props: any) => {
        hoisted.capturedFilterableTableProps = props;
        return <div data-testid="meeting-notes-table-mock" />;
    },
}));

describe("MeetingNotes", () => {
    beforeEach(() => {
        hoisted.capturedFilterableTableProps = null;
        hoisted.meetingNotesRepositoryMock.items = [];
        hoisted.mockLoadItemsFromServerPOST.mockReset();
    });

    it("maps legacy _documentEditUrl into _documentOpenUrl for ActionMenu", async () => {
        hoisted.mockLoadItemsFromServerPOST.mockImplementation(async () => {
            hoisted.meetingNotesRepositoryMock.items = [
                {
                    id: 1,
                    contractId: 123,
                    sequenceNumber: 1,
                    title: "Notatka 1",
                    _documentEditUrl: "https://docs.google.com/document/d/legacy/edit",
                },
            ];
        });

        render(<MeetingNotes />);

        await waitFor(() => {
            expect(hoisted.capturedFilterableTableProps).toBeTruthy();
        });

        expect(hoisted.capturedFilterableTableProps.initialObjects[0]._documentOpenUrl).toBe(
            "https://docs.google.com/document/d/legacy/edit"
        );
    });

    it("keeps _documentOpenUrl when already provided", async () => {
        hoisted.mockLoadItemsFromServerPOST.mockImplementation(async () => {
            hoisted.meetingNotesRepositoryMock.items = [
                {
                    id: 2,
                    contractId: 123,
                    sequenceNumber: 2,
                    title: "Notatka 2",
                    _documentOpenUrl: "https://docs.google.com/document/d/open/view",
                    _documentEditUrl: "https://docs.google.com/document/d/edit/fallback",
                },
            ];
        });

        render(<MeetingNotes />);

        await waitFor(() => {
            expect(hoisted.capturedFilterableTableProps).toBeTruthy();
        });

        expect(hoisted.capturedFilterableTableProps.initialObjects[0]._documentOpenUrl).toBe(
            "https://docs.google.com/document/d/open/view"
        );
    });
});
