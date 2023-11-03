"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const EntityModalButtons_1 = require("./Modals/EntityModalButtons");
const EntitiesController_1 = require("./EntitiesController");
const EntityFilterBody_1 = require("./EntityFilterBody");
function EntitiesSearch({ title }) {
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
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'entities', title: title, FilterBodyComponent: EntityFilterBody_1.EntitiesFilterBody, tableStructure: [
            { header: 'Nazwa', objectAttributeToShow: 'name' },
            { header: 'Adres', objectAttributeToShow: 'address' },
            { header: 'NIP', objectAttributeToShow: 'taxNumber' },
            { header: 'Telefon', objectAttributeToShow: 'phone' },
        ], AddNewButtonComponents: [EntityModalButtons_1.EntityAddNewModalButton], EditButtonComponent: EntityModalButtons_1.EntityEditModalButton, isDeletable: true, repository: EntitiesController_1.entitiesRepository, selectedObjectRoute: '/entity/' }));
}
exports.default = EntitiesSearch;
