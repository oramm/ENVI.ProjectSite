"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const vitest_1 = require("vitest");
const MeetingAgendaPanel_1 = __importDefault(require("./MeetingAgendaPanel"));
const hoisted = vitest_1.vi.hoisted(() => ({
    arrangementItems: [],
    noteExists: false,
    mockLoadArrangements: vitest_1.vi.fn(),
}));
vitest_1.vi.mock("../../ContractsController", () => ({
    meetingArrangementsRepository: {
        items: [],
        loadItemsFromServerPOST: (...args) => hoisted.mockLoadArrangements(...args),
    },
    meetingNotesRepository: {
        loadItemsFromServerPOST: vitest_1.vi.fn(),
        addNewItem: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock("../ContractDetailsContext", () => ({
    useContractDetails: () => ({
        contract: { id: 321 },
    }),
}));
vitest_1.vi.mock("./Modals/MeetingArrangementModalButtons", () => ({
    MeetingArrangementAddNewModalButton: () => null,
    MeetingArrangementEditModalButton: () => null,
}));
vitest_1.vi.mock("../../../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: () => react_1.default.createElement("div", { "data-testid": "filterable-table-mock" }),
}));
vitest_1.vi.mock("./MeetingNoteSection", () => ({
    default: ({ onNoteStateChange, }) => {
        react_1.default.useEffect(() => {
            onNoteStateChange?.(hoisted.noteExists ? { id: 1 } : null);
        }, [onNoteStateChange]);
        return react_1.default.createElement("div", { "data-testid": "meeting-note-section-mock" });
    },
}));
vitest_1.vi.mock("../../../../View/Resultsets/CommonComponents", () => ({
    SpinnerBootstrap: () => react_1.default.createElement("div", { "data-testid": "spinner" }),
}));
(0, vitest_1.describe)("MeetingAgendaPanel", () => {
    const meeting = {
        id: 44,
        name: "Spotkanie koordynacyjne",
        date: "2026-03-13",
    };
    (0, vitest_1.beforeEach)(() => {
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
    (0, vitest_1.it)("renders generate button when no note exists for the meeting", async () => {
        (0, react_2.render)(react_1.default.createElement(MeetingAgendaPanel_1.default, { meeting: meeting }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByRole("button", { name: "Generuj notatkę ze spotkania" })).toBeInTheDocument();
        });
    });
    (0, vitest_1.it)("does not render generate button when note already exists for the meeting", async () => {
        hoisted.noteExists = true;
        (0, react_2.render)(react_1.default.createElement(MeetingAgendaPanel_1.default, { meeting: meeting }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByTestId("meeting-note-section-mock")).toBeInTheDocument();
        });
        (0, vitest_1.expect)(react_2.screen.queryByRole("button", { name: "Generuj notatkę ze spotkania" })).not.toBeInTheDocument();
    });
});
