"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteModalButton = exports.FiterableTableRow = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const GeneralModalButtons_1 = require("../../Modals/GeneralModalButtons");
const CommonComponents_1 = require("../CommonComponents");
const FilterableTableContext_1 = require("./FilterableTableContext");
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
        isDeletable && (react_1.default.createElement(DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject } }))));
}
function DeleteModalButton({ modalProps: { onDelete, initialData } }) {
    const { repository } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const modalTitle = 'Usuwanie ' + (initialData.name || 'wybranego elementu');
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralDeleteModalButton, { modalProps: {
            onDelete,
            modalTitle,
            repository,
            initialData,
        } }));
}
exports.DeleteModalButton = DeleteModalButton;
