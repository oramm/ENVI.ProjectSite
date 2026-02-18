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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterableTableRow = FilterableTableRow;
exports.RowActionMenu = RowActionMenu;
exports.DeleteModalButton = DeleteModalButton;
exports.CopyModalButton = CopyModalButton;
exports.getRowClass = getRowClass;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const GeneralModalButtons_1 = require("../../Modals/GeneralModalButtons");
const CommonComponents_1 = require("../CommonComponents");
const FilterableTableContext_1 = require("./FilterableTableContext");
const react_bootstrap_1 = require("react-bootstrap");
const ResultSetTable_1 = require("./ResultSetTable");
const ToolsRouting_1 = require("../../../React/Tools/ToolsRouting");
function FilterableTableRow({ dataObject, isActive, isStriped, onRowClick, }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { selectedObjectRoute, tableStructure } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { handleEditObject, handleCopyObject, handleDeleteObject, EditButtonComponent, isDeletable, isCopyable, repository, shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute, } = (0, FilterableTableContext_1.useFilterableTableContext)();
    function tdBodyRender(columnStructure, dataObject) {
        if (columnStructure.objectAttributeToShow !== undefined) {
            const key = columnStructure.objectAttributeToShow;
            return String(dataObject[key] ?? "");
        }
        if (columnStructure.renderTdBody !== undefined)
            return columnStructure.renderTdBody(dataObject, isActive);
        return "";
    }
    return (react_1.default.createElement(react_bootstrap_1.Row, { onClick: (e) => onRowClick(dataObject.id), onDoubleClick: () => {
            if (!selectedObjectRoute)
                return;
            const target = (0, ToolsRouting_1.buildDetailsPath)(selectedObjectRoute, dataObject.id);
            if (target)
                navigate(target, { state: { repository } });
        }, className: `${getRowClass({ isActive, isStriped })}` },
        tableStructure.map((column, index) => {
            const key = String(column.objectAttributeToShow || index);
            // xs jest nadpisywane celowo: 11/12 dla isActive (rezerwacja dla RowActionMenu), 12/12 dla inactive
            return (react_1.default.createElement(react_bootstrap_1.Col, { key: key, ...(0, ResultSetTable_1.getColSize)(column), xs: isActive ? 11 : 12 }, tdBodyRender(column, dataObject)));
        }),
        isActive && (react_1.default.createElement(react_bootstrap_1.Col, { xs: "1" },
            react_1.default.createElement("div", { className: "d-flex justify-content-center" },
                " ",
                react_1.default.createElement(RowActionMenu, { dataObject: dataObject, handleEditObject: handleEditObject, handleCopyObject: handleCopyObject, EditButtonComponent: EditButtonComponent, handleDeleteObject: handleDeleteObject, isDeletable: isDeletable, isCopyable: isCopyable, shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute: specialRetrieveActionRoute }))))));
}
function RowActionMenu({ dataObject, handleEditObject, handleCopyObject, EditButtonComponent, handleDeleteObject, isDeletable, isCopyable = false, layout = "vertical", sectionRepository, shouldRetrieveDataBeforeEdit = false, specialRetrieveActionRoute, submenuItems = [], }) {
    const repository = sectionRepository || (0, FilterableTableContext_1.useFilterableTableContext)().repository;
    const [isMenuExpanded, setIsMenuExpanded] = (0, react_1.useState)(false);
    // Oblicz isDeletable - może być boolean lub funkcja
    const canDelete = typeof isDeletable === "function" ? isDeletable(dataObject) : isDeletable;
    function toggleMenu() {
        setIsMenuExpanded((prevState) => !prevState);
    }
    return (react_1.default.createElement("div", { className: `d-flex ${layout === "vertical" ? "flex-column align-items-start" : "flex-row align-items-center"}` },
        dataObject._gdFolderUrl && react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { layout: layout, folderUrl: dataObject._gdFolderUrl }),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { layout: layout, folderUrl: dataObject._documentOpenUrl })),
        " ",
        EditButtonComponent && handleEditObject && (react_1.default.createElement(EditButtonComponent, { modalProps: {
                onEdit: handleEditObject,
                initialData: dataObject,
                shouldRetrieveDataBeforeEdit,
                specialRetrieveActionRoute,
                repository: repository,
            }, buttonProps: { layout } })),
        " ",
        isCopyable && handleCopyObject && (react_1.default.createElement(CopyModalButton, { modalProps: {
                onCopy: handleCopyObject,
                initialData: dataObject,
                repository: repository,
            }, buttonProps: { layout } })),
        canDelete && handleDeleteObject && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CommonComponents_1.MenuExpandIconButton, { layout: layout, onClick: toggleMenu }),
            isMenuExpanded && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject, repository }, buttonProps: { layout } }),
                submenuItems.map((SubmenuItem, index) => handleEditObject && (react_1.default.createElement(SubmenuItem, { key: index, modalProps: {
                        onEdit: handleEditObject,
                        initialData: dataObject,
                        repository: repository,
                    }, buttonProps: { layout, buttonCaption: "Edytuj" } })))))))));
}
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
function CopyModalButton({ modalProps: { onCopy, initialData, repository }, buttonProps, }) {
    const name = "name" in initialData ? initialData.name : undefined;
    const modalTitle = "Kopiowanie " + (name || "wybranego elementu");
    return (react_1.default.createElement(GeneralModalButtons_1.GeneralCopyModalButton, { modalProps: {
            onCopy,
            modalTitle,
            repository,
            initialData,
        }, buttonProps: buttonProps }));
}
/**
 * Returns a string with the class names for the row based on the active state and striped row state.
 */
function getRowClass({ isActive, isStriped }) {
    return [
        "p-3 mb-2 rounded shadow-sm mx-0",
        isStriped && !isActive && "bg-light rounded shadow-sm",
        isActive && "bg-primary bg-opacity-10 border-start border-4 border-primary",
        !isActive && "row-hover",
    ]
        .filter(Boolean)
        .join(" ");
}
