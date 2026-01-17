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
exports.ResultSetTable = ResultSetTable;
exports.renderHeaderBody = renderHeaderBody;
exports.getColSize = getColSize;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTableContext_1 = require("./FilterableTableContext");
const FilterableTableRow_1 = require("./FilterableTableRow");
const ErrorBoundary_1 = __importDefault(require("../../Modals/ErrorBoundary"));
function ResultSetTable({ showTableHeader, onRowClick, filteredObjects, isStriped = true, parentSectionId, }) {
    const { objects, activeRowId, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [objectsToShow, setObjectsToShow] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("div", null,
            showTableHeader && (react_1.default.createElement("div", { className: "d-none d-md-block" },
                react_1.default.createElement(react_bootstrap_1.Row, { className: "fw-bold text-secondary" }, tableStructure.map((column, index) => (react_1.default.createElement(react_bootstrap_1.Col, { key: column.header || index, ...getColSize(column), className: "text-center" }, renderHeaderBody(column))))))),
            react_1.default.createElement("div", { className: "d-flex flex-column gap-2" }, objectsToShow.map((dataObject, index) => {
                const isActive = dataObject.id === activeRowId;
                const isStripedRow = isStriped && objectsToShow.length > 5 && index % 2 === 1;
                return (react_1.default.createElement(ErrorBoundary_1.default, { key: dataObject.id },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(FilterableTableRow_1.FilterableTableRow, { 
                            //key={dataObject.id}
                            dataObject: dataObject, isActive: isActive, isStriped: isStripedRow, onRowClick: (id) => onRowClick(id, parentSectionId) }))));
            })))));
}
function renderHeaderBody(column) {
    if (column.header)
        return column.header;
    if (!column.renderThBody)
        return "";
    return column.renderThBody();
}
function getColSize(column) {
    return {
        xs: 12,
        sm: column.colSm || 11,
        md: column.colMd,
        lg: column.colLg,
    };
}
