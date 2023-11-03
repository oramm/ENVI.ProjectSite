"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const PersonFilterBody_1 = require("./PersonFilterBody");
const PersonModalButtons_1 = require("./Modals/PersonModalButtons");
const PersonsController_1 = require("./PersonsController");
function PersonsSearch({ title }) {
    function buildLabelFromEntities(entities) {
        if (!entities || entities.length === 0)
            return '';
        let label = '';
        for (let i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + '\n ';
        }
        label += entities[entities.length - 1].name;
        return label;
    }
    function makeEntitiesLabel(entity) {
        const mainEntitiesLabel = buildLabelFromEntities(entity._entitiesMain);
        const ccEntitiesLabel = buildLabelFromEntities(entity._entitiesCc);
        if (!mainEntitiesLabel)
            return react_1.default.createElement(react_1.default.Fragment, null);
        let label = mainEntitiesLabel;
        if (ccEntitiesLabel?.length > 0) {
            label += '\n\nDW: ' + ccEntitiesLabel;
        }
        return react_1.default.createElement("div", { style: { whiteSpace: 'pre-line' } }, label);
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'persons', title: title, FilterBodyComponent: PersonFilterBody_1.PersonsFilterBody, tableStructure: [
            { header: 'Imię', objectAttributeToShow: 'name' },
            { header: 'Nazwisko', objectAttributeToShow: 'surname' },
            { header: 'Telefon', objectAttributeToShow: 'phone' },
            { header: 'Email', objectAttributeToShow: 'email' },
            { header: 'Stanowisko', objectAttributeToShow: 'position' },
            { header: 'Opis', objectAttributeToShow: 'comment' }
        ], AddNewButtonComponents: [PersonModalButtons_1.PersonAddNewModalButton], EditButtonComponent: PersonModalButtons_1.PersonEditModalButton, isDeletable: true, repository: PersonsController_1.personsRepository, selectedObjectRoute: '/person/' }));
}
exports.default = PersonsSearch;
