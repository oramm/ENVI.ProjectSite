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
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const LettersController_1 = require("./LettersController");
const LetterFilterBody_1 = require("./LetterFilterBody");
const LetterModalButtons_1 = require("./Modals/LetterModalButtons");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const react_bootstrap_1 = require("react-bootstrap");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const GeneralModalButtons_1 = require("../../View/Modals/GeneralModalButtons");
const FilterableTableContext_1 = require("../../View/Resultsets/FilterableTable/FilterableTableContext");
const LetterModalBodiesPartial_1 = require("./Modals/LetterModalBodiesPartial");
function LettersSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function buildLabelFromEntities(entities) {
        if (!entities || entities.length === 0)
            return "";
        let label = "";
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + "\n ";
        }
        label += entities[entities.length - 1].name;
        return label;
    }
    function makeEntitiesLabel(letter) {
        const mainEntitiesLabel = buildLabelFromEntities(letter._entitiesMain);
        const ccEntitiesLabel = buildLabelFromEntities(letter._entitiesCc);
        if (!mainEntitiesLabel)
            return react_1.default.createElement(react_1.default.Fragment, null);
        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += "\n\nDW: " + ccEntitiesLabel;
        }
        return react_1.default.createElement("div", { style: { whiteSpace: "pre-line" } }, label);
    }
    function renderIconTdBody(letter) {
        const icon = letter.isOur ? free_solid_svg_icons_1.faPaperPlane : free_solid_svg_icons_1.faEnvelope;
        return react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" });
    }
    function ExportToPDFButtonWithError({ ourLetterContract, isActive, }) {
        const [error, setError] = (0, react_1.useState)(null);
        (0, react_1.useEffect)(() => {
            if (error) {
                console.log("Error zaktualizowany:", error.message);
            }
        }, [error]);
        if (!ourLetterContract.isOur || !isActive)
            return null;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(LetterModalButtons_1.ExportOurLetterContractToPDFButton, { onError: (error) => setError(error), ourLetterContract: ourLetterContract }),
            error && (react_1.default.createElement(react_bootstrap_1.Alert, { dismissible: true, variant: "danger", className: "mt-2", onClose: () => setError(null) }, error.message))));
    }
    function renderLastEvent(letter) {
        if (!letter._lastEvent)
            return null;
        return (react_1.default.createElement("div", { className: "text-muted small mt-2" },
            react_1.default.createElement("span", { className: "fw-bold" }, Tools_1.default.getLabelFromKey(letter._lastEvent.eventType, MainSetupReact_1.default.LetterEventType)),
            " ",
            ToolsDate_1.default.dateToDDmmmYYYYHHMM(letter._lastEvent._lastUpdated),
            " przez ",
            letter._lastEvent._editor.name,
            " ",
            letter._lastEvent._editor.surname));
    }
    function renderStatus(letter) {
        const { handleEditObject } = (0, FilterableTableContext_1.useFilterableTableContext)();
        return (react_1.default.createElement(GeneralModalButtons_1.PartialEditTrigger, { modalProps: {
                initialData: letter,
                modalTitle: `Edycja statusu pisma ${letter.number}`,
                modalSubtitle: `Dotyczy: ${letter.description}`,
                repository: LettersController_1.lettersRepository,
                ModalBodyComponent: LetterModalBodiesPartial_1.LetterModalBodyStatus,
                onEdit: handleEditObject,
                fieldsToUpdate: ["status"],
            } },
            react_1.default.createElement(CommonComponents_1.LetterStatusBadge, { status: letter.status || "" })));
    }
    function renderRowContent(letter, isActive = false) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            letter.number && (react_1.default.createElement("div", null,
                "Numer: ",
                react_1.default.createElement("strong", null, letter.number),
                " ",
                renderStatus(letter))),
            react_1.default.createElement("div", { className: "mt-2", style: { whiteSpace: "pre-line" } },
                "Dotyczy: ",
                letter.description,
                letter.relatedLetterNumber && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("br", null),
                    "W odpowiedzi na pismo nr: ",
                    letter.relatedLetterNumber)),
                letter.responseDueDate && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("br", null),
                    "Wymagana odpowiedzi do dnia: ",
                    ToolsDate_1.default.dateDMYtoYMD(ToolsDate_1.default.dateISOToDMY(letter.responseDueDate)))),
                letter.responseIKNumber && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("br", null),
                    "Odpowied\u017A IK: ",
                    letter.responseIKNumber))),
            letter.isOur && react_1.default.createElement(ExportToPDFButtonWithError, { ourLetterContract: letter, isActive: isActive }),
            renderLastEvent(letter)));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "contractsLetters", title: title, FilterBodyComponent: LetterFilterBody_1.LettersFilterBody, tableStructure: [
            { renderThBody: () => react_1.default.createElement("i", { className: "fa fa-inbox fa-lg" }), renderTdBody: renderIconTdBody, colLg: 1 },
            { header: "Utworzono", objectAttributeToShow: "creationDate", colLg: 1 },
            { header: "Wysłano", objectAttributeToShow: "registrationDate", colLg: 1 },
            { header: "Dane Pisma", renderTdBody: renderRowContent, colLg: 4 },
            { header: "Odbiorcy", renderTdBody: makeEntitiesLabel, colLg: 3 },
        ], AddNewButtonComponents: [LetterModalButtons_1.OurLetterAddNewModalButton, LetterModalButtons_1.IncomingLetterAddNewModalButton], EditButtonComponent: LetterModalButtons_1.LetterEditModalButton, isDeletable: true, repository: LettersController_1.lettersRepository, selectedObjectRoute: "/letter/" }));
}
exports.default = LettersSearch;
