"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableTitle = exports.handleSubmitFilterableTable = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
function FilteredTable({ title, filters, onSubmitSearch, onEdit, onDelete, onIsReadyChange, onAdd, objects, isReady, activeRowId, onRowClick: onRowClick, tableHeaders, rowRenderer }) {
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(TableTitle, { title: title }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                " ",
                react_1.default.createElement(FilterPanel, { filters: filters, onSubmit: onSubmitSearch }))),
        !isReady && react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("progress", { style: { height: "5px" } })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null, objects.length > 0 && (react_1.default.createElement(ResultSetTable, { objects: objects, activeRowId: activeRowId, onRowClick: onRowClick, tableHeaders: tableHeaders, rowRenderer: rowRenderer, onIsReadyChange: onIsReadyChange, onEdit: onEdit, onDelete: onDelete, onAdd: onAdd }))))));
}
exports.default = FilteredTable;
function FilterPanel({ filters, onSubmit }) {
    return (react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: onSubmit },
        filters.map((filter, index) => (react_1.default.createElement(react_bootstrap_1.Col, { key: index },
            " ",
            filter,
            " "))),
        react_1.default.createElement(react_bootstrap_1.Col, null,
            react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj"))));
}
/**
 *  Obsługuje wyszukiwanie w tabeli z filtrowaniem
 */
async function handleSubmitFilterableTable(e, repository, additionalParameters) {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (additionalParameters?.length)
        for (const param of additionalParameters)
            formData.append(param.name, param.value);
    return await repository.loadItemsfromServer(formData);
}
exports.handleSubmitFilterableTable = handleSubmitFilterableTable;
function ResultSetTable({ objects, activeRowId, onRowClick, tableHeaders, rowRenderer, onIsReadyChange, onEdit, onDelete, onAdd }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm" },
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null, tableHeaders.map((header, index) => (react_1.default.createElement("th", { key: index }, header))))),
        react_1.default.createElement("tbody", null, objects.map((dataObject) => {
            const isActive = dataObject.id === activeRowId;
            return (react_1.default.createElement("tr", { key: dataObject.id, onClick: (e) => (onRowClick(dataObject.id)), onDoubleClick: () => { console.log('dblClick'); navigate('/contract/' + dataObject.id); }, className: isActive ? 'active' : '' }, rowRenderer({
                dataObject,
                isActive,
                onIsReadyChange,
                onEdit,
                onDelete,
                onAdd
            })));
        }))));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
