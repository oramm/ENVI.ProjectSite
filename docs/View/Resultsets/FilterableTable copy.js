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
exports.useFilteredTableState = exports.useFilteredTableContext = exports.TableTitle = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../FormContext");
const react_hook_form_1 = require("react-hook-form");
const CommonComponentsController_1 = require("./CommonComponentsController");
function FilteredTable({ title, repository, tableHeaders, RowComponent, AddNewButtons = [], FilterBodyComponent }) {
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const [activeRowId, setActiveRowId] = (0, react_1.useState)(0);
    const { handleAddObject, handleEditObject, handleDeleteObject, objects } = (0, exports.useFilteredTableState)();
    //const filteredTableState = useFilteredTableState();
    function handleRowClick(id) {
        console.log('handleRowClick', id);
        setActiveRowId(id);
        repository.addToCurrentItems(id);
    }
    return (react_1.default.createElement(FilteredTableContext.Provider, { value: { handleAddObject, handleEditObject, handleDeleteObject, objects } },
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(TableTitle, { title: title })),
                AddNewButtons &&
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" }, AddNewButtons.map((ButtonComponent, index) => (react_1.default.createElement(react_1.default.Fragment, { key: index },
                        react_1.default.createElement(ButtonComponent, { modalProps: {
                                onAddNew: handleAddObject,
                                onIsReadyChange(isReady) { setIsReady(isReady); }
                            } }),
                        index < AddNewButtons.length - 1 && ' '))))),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(FilterPanel, { FilterBodyComponent: FilterBodyComponent, repository: repository, onIsReadyCHange: (isReady) => {
                        setIsReady(isReady);
                    } })),
            !isReady && react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement("progress", { style: { height: "5px" } })),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null, objects.length > 0 && (react_1.default.createElement(ResultSetTable, { objects: objects, activeRowId: activeRowId, onRowClick: handleRowClick, tableHeaders: tableHeaders, RowComponent: RowComponent, onIsReadyChange: (isReady) => { setIsReady(isReady); }, onEdit: handleEditObject, onDelete: handleDeleteObject, onAddNew: handleAddObject })))))));
}
exports.default = FilteredTable;
function FilterPanel({ FilterBodyComponent, repository, onIsReadyCHange: onIsReadyChange }) {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, } = (0, react_hook_form_1.useForm)({ defaultValues: {}, mode: 'onChange' });
    async function handleSubmitSearch(data) {
        onIsReadyChange(false);
        const formData = (0, CommonComponentsController_1.parseFieldValuestoFormData)(data);
        await repository.loadItemsfromServer(formData);
        onIsReadyChange(false);
    }
    ;
    return (react_1.default.createElement(FormContext_1.FormProvider, { value: { register, setValue, watch, handleSubmit, control, formState: { errors, isValid } } },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit(handleSubmitSearch) },
            react_1.default.createElement(FilterBodyComponent, null),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj")))));
}
function ResultSetTable({ objects, activeRowId, onRowClick, tableHeaders, RowComponent, onIsReadyChange, onEdit, onDelete, onAddNew }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    return (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm" },
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null, tableHeaders.map((header, index) => (react_1.default.createElement("th", { key: index }, header))))),
        react_1.default.createElement("tbody", null, objects.map((dataObject) => {
            const isActive = dataObject.id === activeRowId;
            return (react_1.default.createElement("tr", { key: dataObject.id, onClick: (e) => (onRowClick(dataObject.id)), onDoubleClick: () => { console.log('dblClick'); navigate('/contract/' + dataObject.id); }, className: isActive ? 'active' : '' },
                react_1.default.createElement(RowComponent, { dataObject: dataObject, isActive: isActive, onIsReadyChange: onIsReadyChange, onEdit: onEdit, onDelete: onDelete, onAddNew: onAddNew })));
        }))));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
const FilteredTableContext = (0, react_1.createContext)({});
const useFilteredTableContext = () => {
    return (0, react_1.useContext)(FilteredTableContext);
};
exports.useFilteredTableContext = useFilteredTableContext;
const useFilteredTableState = () => {
    const [objects, setObjects] = (0, react_1.useState)([]);
    function handleAddObject(object) {
        setObjects([...objects, object]);
    }
    function handleEditObject(object) {
        setObjects(objects.map((o) => (o.id === object.id ? object : o)));
    }
    function handleDeleteObject(objectId) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }
    return {
        objects,
        handleAddObject,
        handleEditObject,
        handleDeleteObject,
    };
};
exports.useFilteredTableState = useFilteredTableState;
