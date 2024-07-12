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
exports.DeleteModalButton = exports.RowActionMenu = exports.FilterableTableRow = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const GeneralModalButtons_1 = require("../../Modals/GeneralModalButtons");
const CommonComponents_1 = require("../CommonComponents");
const FilterableTableContext_1 = require("./FilterableTableContext");
function FilterableTableRow({ dataObject, isActive, onRowClick, }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { handleEditObject, handleDeleteObject, EditButtonComponent, isDeletable, repository, shouldRetrieveDataBeforeEdit, } = (0, FilterableTableContext_1.useFilterableTableContext)();
    function tdBodyRender(columnStructure, dataObject) {
        if (columnStructure.objectAttributeToShow !== undefined) {
            const key = columnStructure.objectAttributeToShow;
            return String(dataObject[key] ?? "");
        }
        if (columnStructure.renderTdBody !== undefined)
            return columnStructure.renderTdBody(dataObject, isActive);
        return "";
    }
    return (react_1.default.createElement("tr", { onClick: (e) => onRowClick(dataObject.id), onDoubleClick: () => {
            if (selectedObjectRoute)
                navigate(selectedObjectRoute + dataObject.id, { state: { repository } });
        }, className: isActive ? "active" : "" },
        tableStructure.map((column, index) => {
            const key = String(column.objectAttributeToShow || index);
            return react_1.default.createElement("td", { key: key }, tdBodyRender(column, dataObject));
        }),
        isActive && (react_1.default.createElement("td", { align: "center" },
            react_1.default.createElement(RowActionMenu, { dataObject: dataObject, handleEditObject: handleEditObject, EditButtonComponent: EditButtonComponent, handleDeleteObject: handleDeleteObject, isDeletable: isDeletable, shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit })))));
}
exports.FilterableTableRow = FilterableTableRow;
function RowActionMenu({ dataObject, handleEditObject, EditButtonComponent, handleDeleteObject, isDeletable, layout = "vertical", sectionRepository, shouldRetrieveDataBeforeEdit = false, submenuItems = [], }) {
    const repository = sectionRepository || (0, FilterableTableContext_1.useFilterableTableContext)().repository;
    const [isMenuExpanded, setIsMenuExpanded] = (0, react_1.useState)(false);
    function toggleMenu() {
        setIsMenuExpanded((prevState) => !prevState);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        dataObject._gdFolderUrl && react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { layout: layout, folderUrl: dataObject._gdFolderUrl }),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { layout: layout, folderUrl: dataObject._documentOpenUrl })),
        EditButtonComponent && handleEditObject && (react_1.default.createElement(EditButtonComponent, { modalProps: { onEdit: handleEditObject, initialData: dataObject, shouldRetrieveDataBeforeEdit }, buttonProps: { layout } })),
        isDeletable && handleDeleteObject && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CommonComponents_1.MenuExpandIconButton, { layout: layout, onClick: toggleMenu }),
            isMenuExpanded && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject, repository }, buttonProps: { layout } }),
                submenuItems.map((SubmenuItem, index) => handleEditObject && (react_1.default.createElement(SubmenuItem, { key: index, modalProps: {
                        onEdit: handleEditObject,
                        initialData: dataObject,
                        repository: repository,
                    }, buttonProps: { layout, buttonCaption: "Edytuj" } })))))))));
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
