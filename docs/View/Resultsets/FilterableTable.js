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
exports.TableTitle = exports.handleSubmitFilterableTable = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const OtherContractModalBody_1 = require("../../Contracts/ContractsList/OtherContractModalBody");
const OurContractModalBody_1 = require("../../Contracts/ContractsList/OurContractModalBody");
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const CommonComponentsController_1 = require("./CommonComponentsController");
function FilteredTable({ title, filters, repository, onSubmitSearch, onEdit, onDelete, onIsReadyChange = () => { }, onAddNew, objects, isReady, activeRowId, onRowClick, tableHeaders, rowRenderer }) {
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(TableTitle, { title: title })),
            onAddNew &&
                react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" },
                        react_1.default.createElement(OtherContractModalBody_1.OtherContractAddNewModalButton, { modalProps: { onAddNew, onIsReadyChange } }),
                        ' ',
                        react_1.default.createElement(OurContractModalBody_1.OurContractAddNewModalButton, { modalProps: { onAddNew, onIsReadyChange } })))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(FilterPanel, { filters: filters, repository: repository, onIsReadyCHange: onIsReadyChange })),
        !isReady && react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("progress", { style: { height: "5px" } })),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null, objects.length > 0 && (react_1.default.createElement(ResultSetTable, { objects: objects, activeRowId: activeRowId, onRowClick: onRowClick, tableHeaders: tableHeaders, rowRenderer: rowRenderer, onIsReadyChange: onIsReadyChange, onEdit: onEdit, onDelete: onDelete, onAddNew: onAddNew }))))));
}
exports.default = FilteredTable;
function FilterPanel({ filters, repository, onIsReadyCHange: onIsReadyChange }) {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, } = (0, react_hook_form_1.useForm)({ defaultValues: {}, mode: 'onChange' });
    async function handleSubmitSearch(data) {
        onIsReadyChange(false);
        const formData = (0, CommonComponentsController_1.parseFieldValuestoFormData)(data);
        await repository.loadItemsfromServer(formData);
        onIsReadyChange(false);
    }
    ;
    return (react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit(handleSubmitSearch) },
        react_1.default.createElement(FormContext_1.FormProvider, { value: { register, setValue, watch, handleSubmit, control, formState: { errors, isValid } } },
            filters.map((filter, index) => (react_1.default.createElement(react_bootstrap_1.Col, { key: index },
                " ",
                filter,
                " "))),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj")))));
}
/**
 *  Obsługuje wyszukiwanie w tabeli z filtrowaniem
 * @deprecated
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
function ResultSetTable({ objects, activeRowId, onRowClick, tableHeaders, rowRenderer, onIsReadyChange, onEdit, onDelete, onAddNew }) {
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
                onAddNew
            })));
        }))));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
