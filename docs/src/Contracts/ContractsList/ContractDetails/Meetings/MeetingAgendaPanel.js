"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MeetingAgendaPanel;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../../React/MainSetupReact"));
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractsController_1 = require("../../ContractsController");
const MeetingArrangementModalButtons_1 = require("./Modals/MeetingArrangementModalButtons");
const ContractDetailsContext_1 = require("../ContractDetailsContext");
const MeetingNoteSection_1 = __importDefault(require("./MeetingNoteSection"));
const STATUS_LABELS = {
    PLANNED: "Planowany",
    DISCUSSED: "Omówiony",
    CLOSED: "Zamknięty",
};
const STATUS_VARIANTS = {
    PLANNED: "secondary",
    DISCUSSED: "primary",
    CLOSED: "success",
};
const NEXT_STATUS = {
    PLANNED: "DISCUSSED",
    DISCUSSED: "CLOSED",
};
function StatusBadge({ status }) {
    return react_1.default.createElement(react_bootstrap_1.Badge, { bg: STATUS_VARIANTS[status] || "secondary" }, STATUS_LABELS[status] || status);
}
function MeetingAgendaPanel({ meeting }) {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    const [arrangements, setArrangements] = (0, react_1.useState)(undefined);
    const [arrangementsRefreshToken, setArrangementsRefreshToken] = (0, react_1.useState)(0);
    const [noteRefreshToken, setNoteRefreshToken] = (0, react_1.useState)(0);
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const loadArrangements = (0, react_1.useCallback)(async () => {
        if (!meeting?.id)
            return;
        try {
            const loadedItems = await ContractsController_1.meetingArrangementsRepository.loadItemsFromServerPOST([
                { meetingId: meeting.id },
            ]);
            // Defensive guard: keep only rows that belong to the currently opened meeting.
            const filteredItems = loadedItems.filter((item) => item.meetingId === meeting.id);
            if (filteredItems.length !== loadedItems.length) {
                console.warn("MeetingAgendaPanel: received arrangements from other meetings", {
                    selectedMeetingId: meeting.id,
                    loadedCount: loadedItems.length,
                    filteredCount: filteredItems.length,
                });
            }
            ContractsController_1.meetingArrangementsRepository.items = filteredItems;
            setArrangements([...filteredItems]);
            setArrangementsRefreshToken((prev) => prev + 1);
        }
        catch (error) {
            console.error("MeetingAgendaPanel: unable to load arrangements", error);
            setArrangements([]);
        }
    }, [meeting?.id]);
    (0, react_1.useEffect)(() => {
        loadArrangements();
    }, [loadArrangements]);
    async function handleStatusChange(arrangement) {
        const nextStatus = NEXT_STATUS[arrangement.status];
        if (!nextStatus)
            return;
        try {
            const response = await fetch(`${MainSetupReact_1.default.serverUrl}meetingArrangement/${arrangement.id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!response.ok)
                throw new Error("Status change failed");
            await loadArrangements();
        }
        catch (error) {
            console.error("MeetingAgendaPanel: status change failed", error);
            alert("Nie udało się zmienić statusu");
        }
    }
    async function handleGenerateNote() {
        if (!contract?.id || !meeting?.id || !arrangements?.length)
            return;
        setIsGenerating(true);
        try {
            const existingNotes = await ContractsController_1.meetingNotesRepository.loadItemsFromServerPOST([
                { meetingId: meeting.id },
            ]);
            if (existingNotes.length > 0) {
                alert("Notatka dla tego spotkania już istnieje");
                return;
            }
            await ContractsController_1.meetingNotesRepository.addNewItem({
                contractId: contract.id,
                meetingId: meeting.id,
                title: meeting.name,
                meetingDate: meeting.date,
            });
            setNoteRefreshToken((prev) => prev + 1);
        }
        catch (error) {
            console.error("MeetingAgendaPanel: note generation failed", error);
            alert("Nie udało się wygenerować notatki");
        }
        finally {
            setIsGenerating(false);
        }
    }
    // Wrapper for add button that injects meetingId as contextData
    const ArrangementAddButton = (0, react_1.useMemo)(() => {
        return function WrappedAddButton(props) {
            return react_1.default.createElement(MeetingArrangementModalButtons_1.MeetingArrangementAddNewModalButton, { ...props, contextData: meeting.id });
        };
    }, [meeting.id]);
    if (arrangements === undefined) {
        return (react_1.default.createElement("div", null,
            "\u0141adowanie agendy... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: "shadow-sm border bg-white w-100" },
        react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "bg-white border-bottom px-4 py-3" },
            react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-start gap-3 flex-wrap" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { className: "small text-uppercase text-primary fw-semibold mb-1" }, "Szczeg\u00F3\u0142y spotkania"),
                    react_1.default.createElement("div", { className: "fw-semibold fs-5" }, meeting.name),
                    react_1.default.createElement("div", { className: "text-muted" }, meeting.date)))),
        react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-4" },
            react_1.default.createElement(FilterableTable_1.default, { id: "meetingArrangements", title: "Agenda spotkania", initialObjects: arrangements, repository: ContractsController_1.meetingArrangementsRepository, AddNewButtonComponents: [ArrangementAddButton], EditButtonComponent: MeetingArrangementModalButtons_1.MeetingArrangementEditModalButton, isDeletable: true, showTableHeader: false, tableStructure: [
                    {
                        header: "Sprawa",
                        renderTdBody: (item) => (react_1.default.createElement(react_1.default.Fragment, null,
                            item._case?._type?.folderNumber && (react_1.default.createElement("span", { className: "text-muted me-1" }, item._case._type.folderNumber)),
                            item._case?.name || item.name || "—")),
                    },
                    {
                        header: "Opis",
                        objectAttributeToShow: "description",
                    },
                    {
                        header: "Status",
                        renderTdBody: (item) => (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                            react_1.default.createElement(StatusBadge, { status: item.status }),
                            NEXT_STATUS[item.status] && (react_1.default.createElement(react_bootstrap_1.Button, { size: "sm", variant: "outline-primary", onClick: (e) => {
                                    e.stopPropagation();
                                    handleStatusChange(item);
                                }, title: `Zmień na: ${STATUS_LABELS[NEXT_STATUS[item.status]]}` }, "\u25B6")))),
                    },
                ], externalUpdate: arrangementsRefreshToken }),
            react_1.default.createElement("div", { className: "mt-3" },
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-primary", disabled: !arrangements.length || isGenerating, onClick: handleGenerateNote }, isGenerating ? (react_1.default.createElement(react_1.default.Fragment, null,
                    "Generowanie... ",
                    react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))) : ("Generuj notatkę ze spotkania"))),
            contract?.id && meeting?.id && (react_1.default.createElement(MeetingNoteSection_1.default, { meetingId: meeting.id, refreshToken: noteRefreshToken })))));
}
