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
const react_1 = __importStar(require("react"));
const CommonComponents_1 = require("../CommonComponents");
const FilterableTableRow_1 = require("../FilterableTable/FilterableTableRow");
const DashboardCardContext_1 = require("./DashboardCardContext");
function RowActionMenu({ dataObject, handleEditObject, EditButtonComponent, handleDeleteObject, isDeletable, layout = "vertical", shouldRetrieveDataBeforeEdit = false, specialRetrieveActionRoute, submenuItems = [], }) {
    const repository = (0, DashboardCardContext_1.useDashboardCardContext)().repository;
    const [isMenuExpanded, setIsMenuExpanded] = (0, react_1.useState)(false);
    function toggleMenu() {
        setIsMenuExpanded((prevState) => !prevState);
    }
    return (react_1.default.createElement("div", { className: `d-flex ${layout === "vertical" ? "flex-column align-items-start" : "flex-row align-items-center"}` },
        dataObject._gdFolderUrl && react_1.default.createElement(CommonComponents_1.GDFolderIconLink, { layout: layout, folderUrl: dataObject._gdFolderUrl }),
        dataObject._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { layout: layout, folderUrl: dataObject._documentOpenUrl })),
        EditButtonComponent && handleEditObject && (react_1.default.createElement(EditButtonComponent, { modalProps: {
                onEdit: handleEditObject,
                initialData: dataObject,
                shouldRetrieveDataBeforeEdit,
                specialRetrieveActionRoute,
                repository,
            }, buttonProps: { layout } })),
        isDeletable && handleDeleteObject && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(CommonComponents_1.MenuExpandIconButton, { layout: layout, onClick: toggleMenu }),
            isMenuExpanded && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(FilterableTableRow_1.DeleteModalButton, { modalProps: { onDelete: handleDeleteObject, initialData: dataObject, repository }, buttonProps: { layout } }),
                submenuItems.map((SubmenuItem, index) => handleEditObject && (react_1.default.createElement(SubmenuItem, { key: index, modalProps: {
                        onEdit: handleEditObject,
                        initialData: dataObject,
                        repository: repository,
                    }, buttonProps: { layout, buttonCaption: "Edytuj" } })))))))));
}
exports.default = RowActionMenu;
