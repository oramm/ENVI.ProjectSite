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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../../View/Resultsets/FilterableTable/FilterableTable"));
const ContractDetailsContext_1 = require("../ContractDetailsContext");
const ContractsController_1 = require("../../ContractsController");
const MeetingNoteModalButtons_1 = require("./Modals/MeetingNoteModalButtons");
function MeetingNotes() {
    const { contract } = (0, ContractDetailsContext_1.useContractDetails)();
    const [notes, setNotes] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        async function fetchNotes() {
            if (!contract?.id)
                return;
            await ContractsController_1.meetingNotesRepository.loadItemsFromServerPOST([{ contractId: contract.id }]);
            setNotes([...ContractsController_1.meetingNotesRepository.items]);
        }
        fetchNotes();
    }, [contract?.id]);
    if (!contract) {
        return (react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null, notes ? (react_1.default.createElement(FilterableTable_1.default, { id: "meetingNotes", title: "Notatki ze spotka\u0144", initialObjects: notes, repository: ContractsController_1.meetingNotesRepository, AddNewButtonComponents: [MeetingNoteModalButtons_1.MeetingNoteAddNewModalButton], tableStructure: [
                { header: "#", objectAttributeToShow: "sequenceNumber" },
                { header: "Tytuł", objectAttributeToShow: "title" },
                { header: "Data spotkania", objectAttributeToShow: "meetingDate" },
                {
                    header: "Link do dokumentu",
                    renderTdBody: (note) => note.gdDocumentUrl ? (react_1.default.createElement("a", { href: note.gdDocumentUrl, target: "_blank", rel: "noopener noreferrer" }, "Otw\u00F3rz dokument")) : (react_1.default.createElement(react_1.default.Fragment, null)),
                },
                { header: "Data utworzenia", objectAttributeToShow: "createdAt" },
            ], isDeletable: false })) : (react_1.default.createElement(react_1.default.Fragment, null,
            "\u0141adowanie notatek... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))))));
}
exports.default = MeetingNotes;
