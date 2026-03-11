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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MeetingNoteSection;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const ContractsController_1 = require("../../ContractsController");
const MeetingNoteEditModalButton_1 = require("../MeetingNotes/Modals/MeetingNoteEditModalButton");
const GeneralModalButtons_1 = require("../../../../View/Modals/GeneralModalButtons");
function MeetingNoteSection({ meetingId, contractId }) {
    const [note, setNote] = (0, react_1.useState)(undefined);
    const [isMenuExpanded, setIsMenuExpanded] = (0, react_1.useState)(false);
    function toggleMenu() {
        setIsMenuExpanded((prev) => !prev);
    }
    const loadNote = (0, react_1.useCallback)(async () => {
        try {
            const items = await ContractsController_1.meetingNotesRepository.loadItemsFromServerPOST([{ meetingId }]);
            const found = items.find((n) => n.meetingId === meetingId) ?? null;
            setNote(found);
        }
        catch (error) {
            console.error("MeetingNoteSection: unable to load note", error);
            setNote(null);
        }
    }, [meetingId]);
    (0, react_1.useEffect)(() => {
        loadNote();
    }, [loadNote]);
    if (note === undefined) {
        return (react_1.default.createElement("div", { className: "mt-3" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
    }
    if (!note) {
        return (react_1.default.createElement("div", { className: "mt-2 text-muted" },
            react_1.default.createElement("small", null, "Brak notatki")));
    }
    const documentUrl = note._documentOpenUrl || note._documentEditUrl;
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: "mt-3 mb-0 shadow-sm border-light position-relative" },
        react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "d-flex align-items-center justify-content-between flex-wrap gap-3" },
            react_1.default.createElement("div", { className: "d-flex align-items-center gap-3" },
                documentUrl && (react_1.default.createElement("div", { className: "bg-light p-2 rounded d-flex align-items-center justify-content-center" },
                    react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { folderUrl: documentUrl, layout: "vertical" }))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { className: "fw-bold fs-5 text-dark" }, note.title || "Notatka ze spotkania"),
                    note.meetingDate && react_1.default.createElement("div", { className: "text-muted small" },
                        "Data: ",
                        note.meetingDate),
                    !note.meetingDate && react_1.default.createElement("div", { className: "text-muted small" }, "Dokument powi\u0105zany ze spotkaniem"))),
            react_1.default.createElement("div", { className: "d-flex align-items-center gap-2" },
                react_1.default.createElement("div", { className: "d-flex align-items-center p-1 rounded transition-all" },
                    react_1.default.createElement(CommonComponents_1.MenuExpandIconButton, { layout: "horizontal", onClick: toggleMenu }),
                    isMenuExpanded && (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("div", { className: "border-start mx-1", style: { height: "20px" } }),
                        react_1.default.createElement(MeetingNoteEditModalButton_1.MeetingNoteEditModalButton, { modalProps: {
                                onEdit: loadNote,
                                initialData: note,
                            }, buttonProps: {
                                layout: "horizontal",
                            } }),
                        react_1.default.createElement(GeneralModalButtons_1.GeneralDeleteModalButton, { modalProps: {
                                onDelete: () => setNote(null),
                                modalTitle: "Usuwanie notatki ze spotkania",
                                initialData: note,
                                repository: ContractsController_1.meetingNotesRepository,
                            }, buttonProps: {
                                layout: "horizontal",
                            } }))))))));
}
