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
exports.renderHeaderBody = exports.ResultSetTable = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTableContext_1 = require("./FilterableTableContext");
const FilterableTableRow_1 = require("./FilterableTableRow");
function ResultSetTable({ showTableHeader, onRowClick, onIsReadyChange, filteredObjects, }) {
    const { objects, activeRowId, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [objectsToShow, setObjectsToShow] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Table, { className: objectsToShow.length > 5 ? "table-striped" : "", hover: true, size: "sm" },
            showTableHeader && (react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null, tableStructure.map((column, index) => (react_1.default.createElement("th", { key: column.header || index }, renderHeaderBody(column))))))),
            react_1.default.createElement("tbody", null, objectsToShow.map((dataObject) => {
                const isActive = dataObject.id === activeRowId;
                return (react_1.default.createElement(FilterableTableRow_1.FilterableTableRow, { key: dataObject.id, dataObject: dataObject, isActive: isActive, onIsReadyChange: onIsReadyChange, onRowClick: onRowClick }));
            })))));
}
exports.ResultSetTable = ResultSetTable;
function renderHeaderBody(column) {
    if (column.header)
        return column.header;
    if (!column.renderThBody)
        return "";
    return column.renderThBody();
}
exports.renderHeaderBody = renderHeaderBody;
