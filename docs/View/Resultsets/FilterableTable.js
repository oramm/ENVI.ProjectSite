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
exports.FilterableTableContext = exports.DeleteModalButton = exports.TableTitle = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FormContext_1 = require("../Modals/FormContext");
const react_hook_form_1 = require("react-hook-form");
const CommonComponentsController_1 = require("./CommonComponentsController");
const CommonComponents_1 = require("./CommonComponents");
const react_router_dom_1 = require("react-router-dom");
const GeneralModalButtons_1 = require("../Modals/GeneralModalButtons");
/** Wyświetla tablicę z filtrem i modalami CRUD
 * @param title tytuł tabeli
 * @param tableStructure struktura tabeli (nagłówki i atrybuty obiektów do wyświetlenia w kolumnach lub funkcja zwracająca komponenty do wyświetlenia w kolumnach)
 * @param repository repozytorium z danymi
 * @param AddNewButtonComponents komponenty przycisków dodawania nowych obiektów (domyślnie jeden)
 * @param EditButtonComponent komponent przycisku edycji obiektu
 * @param isDeletable czy można usuwać obiekty z tabeli (domyślnie true)
 * @param FilterBodyComponent komponent zawartości filtra
 * @param selectedObjectRoute ścieżka do wyświetlenia szczegółów obiektu
 */
function FilterableTable({ title, repository, tableStructure, AddNewButtonComponents = [], EditButtonComponent, isDeletable = true, FilterBodyComponent, selectedObjectRoute = '', }) {
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
    return (react_1.default.createElement(FilterableTableProvider, { objects: objects, activeRowId: activeRowId, repository: repository, tableStructure: tableStructure, handleAddObject: handleAddObject, handleEditObject: handleEditObject, handleDeleteObject: handleDeleteObject, setObjects: setObjects, selectedObjectRoute: selectedObjectRoute, EditButtonComponent: EditButtonComponent, isDeletable: isDeletable },
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
exports.default = FilterableTable;
function FilterPanel({ FilterBodyComponent, repository, onIsReadyChange }) {
    const [errorMessage, setErrorMessage] = (0, react_1.useState)('');
    const { setObjects } = useFilterableTableContext();
    const formMethods = (0, react_hook_form_1.useForm)({ defaultValues: {}, mode: 'onChange' });
    async function handleSubmitSearch(data) {
        onIsReadyChange(false);
        const formData = (0, CommonComponentsController_1.parseFieldValuestoFormData)(data);
        const result = await repository.loadItemsfromServer(formData);
        setObjects(result);
        onIsReadyChange(true);
    }
    ;
    return (react_1.default.createElement(FormContext_1.FormProvider, { value: formMethods },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: formMethods.handleSubmit(handleSubmitSearch) },
            react_1.default.createElement(FilterBodyComponent, null),
            react_1.default.createElement(react_bootstrap_1.Row, { xl: 1 },
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
                    react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj"))))));
}
function renderHeaderBody(column) {
    if (column.header)
        return column.header;
    if (!column.renderThBody)
        return '';
    return column.renderThBody();
}
function ResultSetTable({ onRowClick, onIsReadyChange, }) {
    const { objects, activeRowId, tableStructure } = useFilterableTableContext();
    return (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm" },
        react_1.default.createElement("thead", null,
            react_1.default.createElement("tr", null, tableStructure.map((column) => (react_1.default.createElement("th", { key: column.renderThBody?.name || column.header }, renderHeaderBody(column)))))),
        react_1.default.createElement("tbody", null, objects.map((dataObject) => {
            const isActive = dataObject.id === activeRowId;
            return (react_1.default.createElement(FiterableTableRow, { key: dataObject.id, dataObject: dataObject, isActive: isActive, onIsReadyChange: onIsReadyChange, onRowClick: onRowClick }));
        }))));
}
function FiterableTableRow({ dataObject, isActive, onIsReadyChange, onRowClick }) {
    if (!onIsReadyChange)
        throw new Error('onIsReadyChange is not defined');
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = useFilterableTableContext();
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
function RowActionMenu({ dataObject, }) {
    const { handleEditObject, handleDeleteObject, EditButtonComponent, isDeletable } = useFilterableTableContext();
    return (react_1.default.createElement(react_1.default.Fragment, null,
        dataObject._gdFolderUrl && (react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { folderUrl: dataObject._gdFolderUrl })),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { folderUrl: dataObject._documentOpenUrl })),
        EditButtonComponent && (react_1.default.createElement(EditButtonComponent, { modalProps: { onEdit: handleEditObject, initialData: dataObject, } })),
        isDeletable && (react_1.default.createElement(DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject } }))));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
function DeleteModalButton({ modalProps: { onDelete, initialData } }) {
    const { repository } = useFilterableTableContext();
    const modalTitle = 'Usuwanie ' + (initialData.name || 'wybranego elementu');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralDeleteModalButton, { modalProps: {
            onDelete,
            modalTitle,
            repository,
            initialData,
        } }));
}
exports.DeleteModalButton = DeleteModalButton;
exports.FilterableTableContext = (0, react_1.createContext)({
    objects: [],
    repository: {},
    tableStructure: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
});
function FilterableTableProvider({ objects, setObjects, repository, handleAddObject, handleEditObject, handleDeleteObject, tableStructure, selectedObjectRoute, activeRowId, EditButtonComponent, isDeletable = true, children, }) {
    const FilterableTableContextGeneric = exports.FilterableTableContext;
    return react_1.default.createElement(FilterableTableContextGeneric.Provider, { value: {
            objects,
            setObjects: setObjects,
            repository,
            tableStructure,
            handleAddObject,
            handleEditObject,
            handleDeleteObject,
            selectedObjectRoute,
            activeRowId,
            EditButtonComponent,
            isDeletable,
        } }, children);
}
function useFilterableTableContext() {
    const context = react_1.default.useContext(exports.FilterableTableContext);
    if (!context) {
        throw new Error('useMyContext must be used under MyContextProvider');
    }
    return context;
}
