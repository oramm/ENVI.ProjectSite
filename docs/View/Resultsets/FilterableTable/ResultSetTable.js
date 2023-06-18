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
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHeaderBody = exports.FiterableTableRow = exports.ResultSetTable = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const CommonComponents_1 = require("../CommonComponents");
const FilterableTable_1 = require("./FilterableTable");
const FilterableTableContext_1 = require("./FilterableTableContext");
function ResultSetTable({ onRowClick, onIsReadyChange, filteredObjects }) {
    const { objects, activeRowId, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [objectsToShow, setObjectsToShow] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null, tableStructure.map((column) => (react_1.default.createElement("th", { key: column.renderThBody?.name || column.header }, renderHeaderBody(column)))))),
            react_1.default.createElement("tbody", null, objectsToShow.map((dataObject) => {
                const isActive = dataObject.id === activeRowId;
                return (react_1.default.createElement(FiterableTableRow, { key: dataObject.id, dataObject: dataObject, isActive: isActive, onIsReadyChange: onIsReadyChange, onRowClick: onRowClick }));
            })))));
}
exports.ResultSetTable = ResultSetTable;
function FiterableTableRow({ dataObject, isActive, onIsReadyChange, onRowClick }) {
    if (!onIsReadyChange)
        throw new Error('onIsReadyChange is not defined');
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    function tdBodyRender(columStructure, dataObject) {
        if (columStructure.objectAttributeToShow !== undefined)
            return dataObject[columStructure.objectAttributeToShow];
        if (columStructure.renderTdBody !== undefined)
            return columStructure.renderTdBody(dataObject);
        return '';
    }
    return (react_1.default.createElement("tr", { onClick: (e) => (onRowClick(dataObject.id)), onDoubleClick: () => {
            if (selectedObjectRoute)
                navigate(selectedObjectRoute + dataObject.id);
        }, className: isActive ? 'active' : '' },
        tableStructure.map((column, index) => (react_1.default.createElement("td", { key: column.objectAttributeToShow || index }, tdBodyRender(column, dataObject)))),
        isActive &&
            react_1.default.createElement("td", { align: 'center' },
                react_1.default.createElement(RowActionMenu, { dataObject: dataObject }))));
}
exports.FiterableTableRow = FiterableTableRow;
function RowActionMenu({ dataObject, }) {
    const { handleEditObject, handleDeleteObject, EditButtonComponent, isDeletable } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        dataObject._gdFolderUrl && (react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { folderUrl: dataObject._gdFolderUrl })),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { folderUrl: dataObject._documentOpenUrl })),
        EditButtonComponent && (react_1.default.createElement(EditButtonComponent, { modalProps: { onEdit: handleEditObject, initialData: dataObject, } })),
        isDeletable && (react_1.default.createElement(FilterableTable_1.DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject } }))));
}
function renderHeaderBody(column) {
    if (column.header)
        return column.header;
    if (!column.renderThBody)
        return '';
    return column.renderThBody();
}
exports.renderHeaderBody = renderHeaderBody;
