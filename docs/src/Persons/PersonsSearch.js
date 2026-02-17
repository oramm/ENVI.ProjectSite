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
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const PersonFilterBody_1 = require("./PersonFilterBody");
const PersonModalButtons_1 = require("./Modals/PersonModalButtons");
const PersonsController_1 = require("./PersonsController");
const PersonProfilePanel_1 = __importDefault(require("./PersonProfilePanel"));
function PersonsSearch({ title }) {
    const [selectedPerson, setSelectedPerson] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderEntityName(person) {
        return person._entity?.name || "-";
    }
    function renderContact(person) {
        const phone = person.phone || person.cellPhone || "-";
        const email = person.email || "-";
        return (react_1.default.createElement("div", { className: "mb-2" },
            react_1.default.createElement("span", { className: "text-muted" }, "Kontakt:"),
            " ",
            react_1.default.createElement("span", { className: "fw-bold" }, phone),
            react_1.default.createElement("span", { className: "text-muted" }, " | "),
            react_1.default.createElement("span", null, email)));
    }
    function renderSkills(person) {
        if (!person._skillNames)
            return null;
        return (react_1.default.createElement("div", { className: "text-muted small", style: { whiteSpace: "pre-line" } },
            react_1.default.createElement("span", { className: "fw-bold" }, "Specjalizacje:"),
            " ",
            person._skillNames));
    }
    function renderRowContent(person) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 mb-2" },
                react_1.default.createElement("h5", { className: "mb-0" },
                    person.name,
                    " ",
                    person.surname),
                person.position && react_1.default.createElement("small", { className: "text-muted" }, person.position)),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("span", { className: "text-muted" }, "Firma:"),
                " ",
                react_1.default.createElement("span", { className: "fw-bold" }, renderEntityName(person))),
            renderContact(person),
            renderSkills(person)));
    }
    const handleRowClick = (0, react_1.useCallback)((person) => {
        setSelectedPerson(person);
    }, []);
    const handleClosePanel = (0, react_1.useCallback)(() => {
        setSelectedPerson(null);
    }, []);
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        react_1.default.createElement(react_bootstrap_1.Col, { md: selectedPerson ? 8 : 12 },
            react_1.default.createElement(FilterableTable_1.default, { id: "persons", title: title, FilterBodyComponent: PersonFilterBody_1.PersonsFilterBody, tableStructure: [
                    { header: undefined, renderTdBody: (person) => renderRowContent(person) },
                ], AddNewButtonComponents: [PersonModalButtons_1.PersonAddNewModalButton], EditButtonComponent: PersonModalButtons_1.PersonEditModalButton, isDeletable: true, repository: PersonsController_1.personsRepository, selectedObjectRoute: "/person/", onRowClick: handleRowClick })),
        selectedPerson && (react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
            react_1.default.createElement(PersonProfilePanel_1.default, { person: selectedPerson, onClose: handleClosePanel })))));
}
exports.default = PersonsSearch;
