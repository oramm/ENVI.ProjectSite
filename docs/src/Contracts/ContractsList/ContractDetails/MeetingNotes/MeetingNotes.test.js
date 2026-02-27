"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const vitest_1 = require("vitest");
const MeetingNotes_1 = __importDefault(require("./MeetingNotes"));
const hoisted = vitest_1.vi.hoisted(() => ({
    mockLoadItemsFromServerPOST: vitest_1.vi.fn(),
    meetingNotesRepositoryMock: {
        items: [],
        loadItemsFromServerPOST: vitest_1.vi.fn(),
    },
    capturedFilterableTableProps: null,
}));
hoisted.meetingNotesRepositoryMock.loadItemsFromServerPOST = hoisted.mockLoadItemsFromServerPOST;
vitest_1.vi.mock("../../ContractsController", () => ({
    meetingNotesRepository: hoisted.meetingNotesRepositoryMock,
}));
vitest_1.vi.mock("../ContractDetailsContext", () => ({
    useContractDetails: () => ({
        contract: { id: 123 },
    }),
}));
vitest_1.vi.mock("./Modals/MeetingNoteModalButtons", () => ({
    MeetingNoteAddNewModalButton: () => null,
}));
vitest_1.vi.mock("../../../../View/Resultsets/FilterableTable/FilterableTable", () => ({
    default: (props) => {
        hoisted.capturedFilterableTableProps = props;
        return react_1.default.createElement("div", { "data-testid": "meeting-notes-table-mock" });
    },
}));
(0, vitest_1.describe)("MeetingNotes", () => {
    (0, vitest_1.beforeEach)(() => {
        hoisted.capturedFilterableTableProps = null;
        hoisted.meetingNotesRepositoryMock.items = [];
        hoisted.mockLoadItemsFromServerPOST.mockReset();
    });
    (0, vitest_1.it)("maps legacy _documentEditUrl into _documentOpenUrl for ActionMenu", async () => {
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
        (0, react_2.render)(react_1.default.createElement(MeetingNotes_1.default, null));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(hoisted.capturedFilterableTableProps).toBeTruthy();
        });
        (0, vitest_1.expect)(hoisted.capturedFilterableTableProps.initialObjects[0]._documentOpenUrl).toBe("https://docs.google.com/document/d/legacy/edit");
    });
    (0, vitest_1.it)("keeps _documentOpenUrl when already provided", async () => {
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
        (0, react_2.render)(react_1.default.createElement(MeetingNotes_1.default, null));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(hoisted.capturedFilterableTableProps).toBeTruthy();
        });
        (0, vitest_1.expect)(hoisted.capturedFilterableTableProps.initialObjects[0]._documentOpenUrl).toBe("https://docs.google.com/document/d/open/view");
    });
});
