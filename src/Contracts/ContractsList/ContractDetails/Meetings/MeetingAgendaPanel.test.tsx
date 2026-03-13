import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MeetingArrangementData, MeetingData } from "../../../../../Typings/bussinesTypes";
import MeetingAgendaPanel from "./MeetingAgendaPanel";

const hoisted = vi.hoisted(() => ({
    arrangementItems: [] as MeetingArrangementData[],
    noteExists: false,
    mockLoadArrangements: vi.fn(),
}));

vi.mock("../../ContractsController", () => ({
    meetingArrangementsRepository: {
        items: [] as MeetingArrangementData[],
        loadItemsFromServerPOST: (...args: any[]) => hoisted.mockLoadArrangements(...args),
    },
    meetingNotesRepository: {
        loadItemsFromServerPOST: vi.fn(),
        addNewItem: vi.fn(),
    },
}));

vi.mock("../ContractDetailsContext", () => ({
    useContractDetails: () => ({
        contract: { id: 321 },
    }),
}));

vi.mock("./Modals/MeetingArrangementModalButtons", () => ({
    MeetingArrangementAddNewModalButton: () => null,
    MeetingArrangementEditModalButton: () => null,
}));

vi.mock("../../../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: () => <div data-testid="filterable-table-mock" />,
}));

vi.mock("./MeetingNoteSection", () => ({
    default: ({
        onNoteStateChange,
    }: {
        onNoteStateChange?: (note: { id?: number } | null) => void;
    }) => {
        React.useEffect(() => {
            onNoteStateChange?.(hoisted.noteExists ? { id: 1 } : null);
        }, [onNoteStateChange]);

        return <div data-testid="meeting-note-section-mock" />;
    },
}));

vi.mock("../../../../View/Resultsets/CommonComponents", () => ({
    SpinnerBootstrap: () => <div data-testid="spinner" />,
}));

describe("MeetingAgendaPanel", () => {
    const meeting: MeetingData = {
        id: 44,
        name: "Spotkanie koordynacyjne",
        date: "2026-03-13",
    };

    beforeEach(() => {
        hoisted.arrangementItems = [
            {
                id: 1,
                meetingId: 44,
                name: "Punkt 1",
                status: "PLANNED",
            },
        ];
        hoisted.noteExists = false;
        hoisted.mockLoadArrangements.mockReset();
        hoisted.mockLoadArrangements.mockImplementation(async () => hoisted.arrangementItems);
    });

    it("renders generate button when no note exists for the meeting", async () => {
        render(<MeetingAgendaPanel meeting={meeting} />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: "Generuj notatkę ze spotkania" })).toBeInTheDocument();
        });
    });

    it("does not render generate button when note already exists for the meeting", async () => {
        hoisted.noteExists = true;

        render(<MeetingAgendaPanel meeting={meeting} />);

        await waitFor(() => {
            expect(screen.getByTestId("meeting-note-section-mock")).toBeInTheDocument();
        });

        expect(screen.queryByRole("button", { name: "Generuj notatkę ze spotkania" })).not.toBeInTheDocument();
    });
});
