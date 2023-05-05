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
exports.FilteredTableContext = exports.TableTitle = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../Modals/FormContext");
const react_hook_form_1 = require("react-hook-form");
const CommonComponentsController_1 = require("./CommonComponentsController");
//import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../Modals/GeneralModal';
const CommonComponents_1 = require("./CommonComponents");
const react_router_dom_1 = require("react-router-dom");
function FilteredTable({ title, repository, tableStructure, AddNewButtonComponents = [], EditButtonComponent, DeleteButtonComponent, FilterBodyComponent, selectedObjectRoute = '', }) {
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const [activeRowId, setActiveRowId] = (0, react_1.useState)(0);
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
    function handleRowClick(id) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        console.log('handleRowClick', repository.currentItems);
    }
    return (react_1.default.createElement(exports.FilteredTableContext.Provider, { value: {
            handleAddObject,
            handleEditObject,
            handleDeleteObject,
            tableStructure,
            objects,
            setObjects,
            selectedObjectRoute,
            activeRowId,
            EditButtonComponent,
            DeleteButtonComponent
        } },
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(TableTitle, { title: title })),
                AddNewButtonComponents &&
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" }, AddNewButtonComponents.map((ButtonComponent, index) => (react_1.default.createElement(react_1.default.Fragment, { key: index },
                        react_1.default.createElement(ButtonComponent, { modalProps: { onAddNew: handleAddObject } }),
                        index < AddNewButtonComponents.length - 1 && ' '))))),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(FilterPanel, { FilterBodyComponent: FilterBodyComponent, repository: repository, onIsReadyChange: (isReady) => {
                        setIsReady(isReady);
                    } })),
            !isReady && react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement("progress", { style: { height: "5px" } })),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null, objects.length > 0 && (react_1.default.createElement(ResultSetTable, { onRowClick: handleRowClick, onIsReadyChange: (isReady) => { setIsReady(isReady); } })))))));
}
exports.default = FilteredTable;
function FilterPanel({ FilterBodyComponent, repository, onIsReadyChange }) {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const { setObjects } = (0, react_1.useContext)(exports.FilteredTableContext);
    const { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger } = (0, react_hook_form_1.useForm)({ defaultValues: {}, mode: 'onChange' });
    async function handleSubmitSearch(data) {
        onIsReadyChange(false);
        const formData = (0, CommonComponentsController_1.parseFieldValuestoFormData)(data);
        const result = await repository.loadItemsfromServer(formData);
        setObjects(result);
        onIsReadyChange(true);
    }
    ;
    return (react_1.default.createElement(FormContext_1.FormProvider, { value: { register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger } },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: handleSubmit(handleSubmitSearch) },
            react_1.default.createElement(FilterBodyComponent, null),
            react_1.default.createElement(react_bootstrap_1.Row, { xl: 1 },
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
                    react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj"))))));
}
function ResultSetTable({ onRowClick, onIsReadyChange, }) {
    const { objects, activeRowId, tableStructure } = (0, react_1.useContext)(exports.FilteredTableContext);
    return (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm" },
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null, tableStructure.map((column, index) => (react_1.default.createElement("th", { key: index }, column.header))))),
        react_1.default.createElement("tbody", null, objects.map((dataObject) => {
            const isActive = dataObject.id === activeRowId;
            return (react_1.default.createElement(FiterableTableRow, { key: dataObject.id, dataObject: dataObject, isActive: isActive, onIsReadyChange: onIsReadyChange, onRowClick: onRowClick }));
        }))));
}
function FiterableTableRow({ dataObject, isActive, onIsReadyChange, onRowClick }) {
    if (!onIsReadyChange)
        throw new Error('onIsReadyChange is not defined');
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = (0, react_1.useContext)(exports.FilteredTableContext);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("tr", { onClick: (e) => (onRowClick(dataObject.id)), onDoubleClick: () => {
                if (selectedObjectRoute)
                    navigate(selectedObjectRoute + dataObject.id);
            }, className: isActive ? 'active' : '' },
            tableStructure.map((column, index) => (react_1.default.createElement("td", { key: index }, dataObject[column.objectAttributeToShow]))),
            isActive &&
                react_1.default.createElement("td", { align: 'center' },
                    react_1.default.createElement(RowActionMenu, { dataObject: dataObject })))));
}
function RowActionMenu({ dataObject, }) {
    const { handleEditObject, handleDeleteObject, EditButtonComponent, DeleteButtonComponent } = (0, react_1.useContext)(exports.FilteredTableContext);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        dataObject._gdFolderUrl && (react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { folderUrl: dataObject._gdFolderUrl })),
        EditButtonComponent && (react_1.default.createElement(EditButtonComponent, { modalProps: { onEdit: handleEditObject, initialData: dataObject, } })),
        DeleteButtonComponent && (react_1.default.createElement(DeleteButtonComponent, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject } }))));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
exports.FilteredTableContext = (0, react_1.createContext)({
    objects: [],
    tableStructure: [{ header: '', objectAttributeToShow: '' }],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    DeleteButtonComponent: undefined,
});
