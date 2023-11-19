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
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const EntityModalButtons_1 = require("./Modals/EntityModalButtons");
const EntitiesController_1 = require("./EntitiesController");
const EntityFilterBody_1 = require("./EntityFilterBody");
function EntitiesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
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
