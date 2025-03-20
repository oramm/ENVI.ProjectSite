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
    function isProjectRole(role) {
        if (!role._project?.id && !role._contract?.id)
            console.error("RoleData is not a ProjectRoleData nor ContractRoleData");
        return role._project !== undefined;
    }
    function renderRow(role) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                role.groupName,
                ": ",
                react_1.default.createElement("strong", null, role.name),
                " | ",
                role._person?._nameSurnameEmail),
            react_1.default.createElement("div", { className: "text-muted" }, role.description),
            isProjectRole(role) ? renderProjectData(role) : renderContractData(role)));
    }
    function renderProjectData(role) {
        if (!role._project?.id)
            return react_1.default.createElement("div", { className: "text-danger" }, "\u26A0\uFE0F Brak danych projektu");
        const { name, ourId, alias } = role._project;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                ourId,
                " ",
                alias,
                " "),
            react_1.default.createElement("div", { className: "text-secondary" }, name)));
    }
    function renderContractData(role) {
        if (!role._contract?.id)
            return react_1.default.createElement("div", { className: "text-danger" }, "\u26A0\uFE0F Brak danych kontraktu");
        const { name, alias, startDate, endDate, _type } = role._contract;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", null,
                "Typ umowy: ",
                _type.name,
                ", ",
                alias),
            react_1.default.createElement("div", { className: "text-secondary" }, name),
            react_1.default.createElement("div", null,
                " ",
                "Realizacja od ",
                startDate,
                " do ",
                endDate)));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "roles", title: title, FilterBodyComponent: RoleFilterBody_1.RolesFilterBody, tableStructure: [{ header: "Nazwa", renderTdBody: renderRow }], AddNewButtonComponents: [RoleModalButtons_1.ProjectRoleAddNewModalButton, RoleModalButtons_1.ContractRoleAddNewModalButton], EditButtonComponent: RoleModalButtons_1.RoleEditModalButton, isDeletable: true, repository: RolesController_1.rolesRepository, selectedObjectRoute: "/role/" }));
}
exports.default = RolesSearch;
