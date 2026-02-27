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
function MeetingNoteSection({ meetingId, contractId }) {
    const [note, setNote] = (0, react_1.useState)(undefined);
    const loadNote = (0, react_1.useCallback)(async () => {
        try {
            const items = await ContractsController_1.meetingNotesRepository.loadItemsFromServerPOST([{ meetingId }]);
            const found = items.find((n) => n.meetingId === meetingId) ?? null;
            setNote(found);
        }
        catch (error) {
            console.error('MeetingNoteSection: unable to load note', error);
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
    return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "light", className: "mt-3 mb-0 border" },
        react_1.default.createElement("div", { className: "d-flex align-items-center justify-content-between" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("strong", null, "Notatka ze spotkania:"),
                ' ',
                note.title,
                documentUrl && (react_1.default.createElement(react_1.default.Fragment, null,
                    ' — ',
                    react_1.default.createElement("a", { href: documentUrl, target: "_blank", rel: "noopener noreferrer" }, "Otw\u00F3rz dokument")))),
            react_1.default.createElement("div", { className: "d-flex gap-2" },
                react_1.default.createElement(MeetingNoteEditModalButton_1.MeetingNoteEditModalButton, { modalProps: {
                        onEdit: loadNote,
                        initialData: note,
                    }, buttonProps: {} }),
                react_1.default.createElement(react_bootstrap_1.Button, { size: "sm", variant: "outline-danger", onClick: async () => {
                        if (!window.confirm('Usunąć notatkę?'))
                            return;
                        try {
                            await ContractsController_1.meetingNotesRepository.deleteItemNodeJS(note.id);
                            setNote(null);
                        }
                        catch (error) {
                            console.error('MeetingNoteSection: delete failed', error);
                            alert('Nie udało się usunąć notatki');
                        }
                    } }, "Usu\u0144")))));
}
