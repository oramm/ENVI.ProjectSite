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
exports.default = PersonsSearch;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const PersonFilterBody_1 = require("./PersonFilterBody");
const PersonModalButtons_1 = require("./Modals/PersonModalButtons");
const PersonsController_1 = require("./PersonsController");
function PersonsSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderEntityName(person) {
        return react_1.default.createElement(react_1.default.Fragment, null, person._entity.name);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "persons", title: title, FilterBodyComponent: PersonFilterBody_1.PersonsFilterBody, tableStructure: [
            {
                header: "Imię i nazwisko",
                renderTdBody: (person) => (react_1.default.createElement(react_1.default.Fragment, null,
                    person.name,
                    " ",
                    person.surname)),
                colMd: 2,
            },
            { header: "Telefon", objectAttributeToShow: "phone", colMd: 2 },
            { header: "Email", objectAttributeToShow: "email", colMd: 2 },
            { header: "Firma", renderTdBody: (person) => renderEntityName(person), colMd: 2 },
            { header: "Stanowisko", objectAttributeToShow: "position", colMd: 1 },
            { header: "Opis", objectAttributeToShow: "comment", colMd: 2 },
        ], AddNewButtonComponents: [PersonModalButtons_1.PersonAddNewModalButton], EditButtonComponent: PersonModalButtons_1.PersonEditModalButton, isDeletable: true, repository: PersonsController_1.personsRepository, selectedObjectRoute: "/person/" }));
}
