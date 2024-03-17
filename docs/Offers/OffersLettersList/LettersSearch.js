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
function OffersLettersSearch({ title }) {
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
        letter = letter;
        const icon = letter.isOur ? free_solid_svg_icons_1.faPaperPlane : free_solid_svg_icons_1.faEnvelope;
        return react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: icon, size: "lg" });
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "letters", title: title, FilterBodyComponent: LetterFilterBody_1.LettersFilterBody, tableStructure: [
            { renderThBody: () => react_1.default.createElement("i", { className: "fa fa-inbox fa-lg" }), renderTdBody: renderIconTdBody },
            { header: "Utworzono", objectAttributeToShow: "creationDate" },
            { header: "Wysłano", objectAttributeToShow: "registrationDate" },
            { header: "Numer", objectAttributeToShow: "number" },
            { header: "Dotyczy", objectAttributeToShow: "description" },
            { header: "Odbiorcy", renderTdBody: makeEntitiesLabel },
        ], AddNewButtonComponents: [LetterModalButtons_1.OurLetterAddNewModalButton, LetterModalButtons_1.IncomingLetterAddNewModalButton], EditButtonComponent: LetterModalButtons_1.LetterEditModalButton, isDeletable: true, repository: LettersController_1.lettersRepository, selectedObjectRoute: "/letter/" }));
}
exports.default = OffersLettersSearch;
