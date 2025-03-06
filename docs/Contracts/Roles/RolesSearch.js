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
const RoleFilterBody_1 = require("./RoleFilterBody");
const RolesController_1 = require("./RolesController");
const RoleModalButtons_1 = require("./Modals/RoleModalButtons");
function RolesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    return (react_1.default.createElement(FilterableTable_1.default, { id: "roles", title: title, FilterBodyComponent: RoleFilterBody_1.RolesFilterBody, tableStructure: [
            { header: "Nazwa", objectAttributeToShow: "name" },
            { header: "Adres", objectAttributeToShow: "groupName" },
            { header: "NIP", objectAttributeToShow: "description" },
        ], AddNewButtonComponents: [RoleModalButtons_1.RoleAddNewModalButton], EditButtonComponent: RoleModalButtons_1.RoleEditModalButton, isDeletable: true, repository: RolesController_1.rolesRepository, selectedObjectRoute: "/role/" }));
}
exports.default = RolesSearch;
