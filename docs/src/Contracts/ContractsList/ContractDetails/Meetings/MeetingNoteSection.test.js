"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const vitest_1 = require("vitest");
const MeetingNoteSection_1 = __importDefault(require("./MeetingNoteSection"));
const hoisted = vitest_1.vi.hoisted(() => ({
    mockLoadItemsFromServerPOST: vitest_1.vi.fn(),
    meetingNotesRepositoryMock: {
        currentItems: [],
        loadItemsFromServerPOST: vitest_1.vi.fn(),
    },
}));
hoisted.meetingNotesRepositoryMock.loadItemsFromServerPOST = hoisted.mockLoadItemsFromServerPOST;
vitest_1.vi.mock("../../ContractsController", () => ({
    meetingNotesRepository: hoisted.meetingNotesRepositoryMock,
}));
vitest_1.vi.mock("../../../../View/Resultsets/CommonComponents", () => ({
    GDDocFileIconLink: () => react_1.default.createElement("div", { "data-testid": "gd-doc-link" }),
    SpinnerBootstrap: () => react_1.default.createElement("div", { "data-testid": "spinner" }),
    MenuExpandIconButton: ({ onClick }) => (react_1.default.createElement("button", { onClick: onClick, type: "button" }, "menu")),
}));
vitest_1.vi.mock("../MeetingNotes/Modals/MeetingNoteEditModalButton", () => ({
    MeetingNoteEditModalButton: () => react_1.default.createElement("div", { "data-testid": "edit-note-button" }),
}));
vitest_1.vi.mock("../../../../View/Modals/GeneralModalButtons", () => ({
    GeneralDeleteModalButton: ({ modalProps }) => (react_1.default.createElement("button", { onClick: modalProps.onDelete, type: "button" }, "delete")),
}));
(0, vitest_1.describe)("MeetingNoteSection", () => {
    (0, vitest_1.beforeEach)(() => {
        hoisted.meetingNotesRepositoryMock.currentItems = [];
        hoisted.mockLoadItemsFromServerPOST.mockReset();
    });
    (0, vitest_1.it)("reports existing note state and keeps repository currentItems in sync", async () => {
        const noteStateSpy = vitest_1.vi.fn();
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
        (0, react_2.render)(react_1.default.createElement(MeetingNoteSection_1.default, { meetingId: 12, onNoteStateChange: noteStateSpy }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByText("Notatka testowa")).toBeInTheDocument();
        });
        (0, vitest_1.expect)(noteStateSpy).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            id: 7,
            meetingId: 12,
        }));
        (0, vitest_1.expect)(hoisted.meetingNotesRepositoryMock.currentItems).toEqual([
            vitest_1.expect.objectContaining({ id: 7 }),
        ]);
    });
    (0, vitest_1.it)("reports missing note state and clears UI after delete", async () => {
        const noteStateSpy = vitest_1.vi.fn();
        hoisted.mockLoadItemsFromServerPOST.mockResolvedValue([
            {
                id: 8,
                contractId: 55,
                meetingId: 15,
                sequenceNumber: 1,
                title: "Do usunięcia",
            },
        ]);
        (0, react_2.render)(react_1.default.createElement(MeetingNoteSection_1.default, { meetingId: 15, onNoteStateChange: noteStateSpy }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByText("Do usunięcia")).toBeInTheDocument();
        });
        react_2.fireEvent.click(react_2.screen.getByRole("button", { name: "menu" }));
        react_2.fireEvent.click(react_2.screen.getByRole("button", { name: "delete" }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByText("Brak notatki")).toBeInTheDocument();
        });
        (0, vitest_1.expect)(noteStateSpy).toHaveBeenLastCalledWith(null);
    });
    (0, vitest_1.it)("renders missing note state when repository returns no note", async () => {
        const noteStateSpy = vitest_1.vi.fn();
        hoisted.mockLoadItemsFromServerPOST.mockResolvedValue([]);
        (0, react_2.render)(react_1.default.createElement(MeetingNoteSection_1.default, { meetingId: 99, onNoteStateChange: noteStateSpy }));
        await (0, react_2.waitFor)(() => {
            (0, vitest_1.expect)(react_2.screen.getByText("Brak notatki")).toBeInTheDocument();
        });
        (0, vitest_1.expect)(noteStateSpy).toHaveBeenCalledWith(null);
    });
});
