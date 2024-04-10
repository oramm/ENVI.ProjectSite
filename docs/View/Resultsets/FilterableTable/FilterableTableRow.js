"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteModalButton = exports.RowActionMenu = exports.FilterableTableRow = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const GeneralModalButtons_1 = require("../../Modals/GeneralModalButtons");
const CommonComponents_1 = require("../CommonComponents");
const FilterableTableContext_1 = require("./FilterableTableContext");
function FilterableTableRow({ dataObject, isActive, onIsReadyChange, onRowClick, }) {
    if (!onIsReadyChange)
        throw new Error("onIsReadyChange is not defined");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { handleEditObject, handleDeleteObject, EditButtonComponent, isDeletable, repository, shouldRetrieveDataBeforeEdit, } = (0, FilterableTableContext_1.useFilterableTableContext)();
    function tdBodyRender(columnStructure, dataObject) {
        if (columnStructure.objectAttributeToShow !== undefined) {
            const key = columnStructure.objectAttributeToShow;
            return String(dataObject[key] ?? "");
        }
        if (columnStructure.renderTdBody !== undefined)
            return columnStructure.renderTdBody(dataObject);
        return "";
    }
    return (react_1.default.createElement("tr", { onClick: (e) => onRowClick(dataObject.id), onDoubleClick: () => {
            if (selectedObjectRoute)
                navigate(selectedObjectRoute + dataObject.id, { state: { repository } });
        }, className: isActive ? "active" : "" },
        tableStructure.map((column, index) => {
            const key = String(column.objectAttributeToShow || index);
            console.log("column", column.objectAttributeToShow, index);
            return react_1.default.createElement("td", { key: key }, tdBodyRender(column, dataObject));
        }),
        isActive && (react_1.default.createElement("td", { align: "center" },
            react_1.default.createElement(RowActionMenu, { dataObject: dataObject, handleEditObject: handleEditObject, EditButtonComponent: EditButtonComponent, handleDeleteObject: handleDeleteObject, isDeletable: isDeletable, shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit })))));
}
exports.FilterableTableRow = FilterableTableRow;
function RowActionMenu({ dataObject, handleEditObject, EditButtonComponent, handleDeleteObject, isDeletable, layout = "vertical", sectionRepository, shouldRetrieveDataBeforeEdit = false, }) {
    const repository = sectionRepository || (0, FilterableTableContext_1.useFilterableTableContext)().repository;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        dataObject._gdFolderUrl && react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { layout: layout, folderUrl: dataObject._gdFolderUrl }),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { layout: layout, folderUrl: dataObject._documentOpenUrl })),
        EditButtonComponent && handleEditObject && (react_1.default.createElement(EditButtonComponent, { modalProps: { onEdit: handleEditObject, initialData: dataObject, shouldRetrieveDataBeforeEdit }, buttonProps: { layout } })),
        isDeletable && handleDeleteObject && (react_1.default.createElement(DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject, repository }, buttonProps: { layout } }))));
}
exports.RowActionMenu = RowActionMenu;
function DeleteModalButton({ modalProps: { onDelete, initialData, repository }, buttonProps, }) {
    const name = "name" in initialData ? initialData.name : undefined;
    const modalTitle = "Usuwanie " + (name || "wybranego elementu");
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralDeleteModalButton, { modalProps: {
            onDelete,
            modalTitle,
            repository,
            initialData,
        }, buttonProps: buttonProps }));
}
exports.DeleteModalButton = DeleteModalButton;
