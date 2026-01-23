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
exports.default = EntitiesSearch;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../View/Resultsets/FilterableTable/FilterableTable"));
const EntityModalButtons_1 = require("./Modals/EntityModalButtons");
const EntitiesController_1 = require("./EntitiesController");
const EntityFilterBody_1 = require("./EntityFilterBody");
function EntitiesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: "entities", title: title, FilterBodyComponent: EntityFilterBody_1.EntitiesFilterBody, tableStructure: [
            { header: "Nazwa", objectAttributeToShow: "name", colMd: 4 },
            { header: "Adres", objectAttributeToShow: "address", colMd: 3 },
            { header: "NIP", objectAttributeToShow: "taxNumber", colMd: 2 },
            { header: "Telefon", objectAttributeToShow: "phone", colMd: 2 },
        ], AddNewButtonComponents: [EntityModalButtons_1.EntityAddNewModalButton], EditButtonComponent: EntityModalButtons_1.EntityEditModalButton, isDeletable: true, repository: EntitiesController_1.entitiesRepository, selectedObjectRoute: "/entity/" }));
}
