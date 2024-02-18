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
exports.Section = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTableContext_1 = require("./FilterableTableContext");
const FiterableTableRow_1 = require("./FiterableTableRow");
const ResultSetTable_1 = require("./ResultSetTable");
require("./FilterableTable.css");
const react_router_dom_1 = require("react-router-dom");
function Section({ sectionNode, resulsetTableProps, onClick, }) {
    const { activeSectionId } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [isActive, setIsActive] = (0, react_1.useState)(activeSectionId === sectionNode.id);
    const { sections } = (0, FilterableTableContext_1.useFilterableTableContext)();
    (0, react_1.useEffect)(() => {
        setIsActive(activeSectionId === sectionNode.id);
    }, [activeSectionId, sectionNode.id, sections]);
    return sectionNode.isInAccordion ? (react_1.default.createElement(react_bootstrap_1.Accordion, { key: sectionNode.id, alwaysOpen: true, defaultActiveKey: ["0"] },
        react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: "0" },
            react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isActive: isActive, onClick: onClick })),
            react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick }))))) : (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isActive: isActive, onClick: onClick }),
        react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick })));
}
exports.Section = Section;
function SectionHeader({ sectionNode, onClick, isActive, }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { handleDeleteSection, handleEditSection, handleAddSection } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { selectedObjectRoute, dataItem } = sectionNode;
    function makeTitleStyle() {
        const nodeLevel = sectionNode.level;
        return {
            fontSize: nodeLevel === 1 ? "1.5rem" : "1rem",
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(${50}, ${130}, ${50})`,
        };
    }
    function makeSectionStyle() {
        return {
            display: "flex",
            alignItems: "center",
            background: !sectionNode.isInAccordion ? "aliceblue" : undefined,
        };
    }
    return (react_1.default.createElement("div", { style: makeSectionStyle(), onDoubleClick: () => {
            if (selectedObjectRoute)
                navigate(selectedObjectRoute + dataItem.id);
        } },
        react_1.default.createElement("div", { className: isActive ? "active" : "", onClick: () => onClick(sectionNode), key: sectionNode.id, style: makeTitleStyle() }, sectionNode.titleLabel),
        (sectionNode.leaves?.length || sectionNode.children.length) > 5 && (react_1.default.createElement("div", { className: "ms-1 tekst-muted small" }, ` [${sectionNode.leaves?.length || sectionNode.children.length} pozycji]`)),
        isActive ? (react_1.default.createElement("div", { className: "section-action-menu" },
            react_1.default.createElement(FiterableTableRow_1.RowActionMenu, { dataObject: sectionNode.dataItem, isDeletable: !!sectionNode.isDeletable, EditButtonComponent: sectionNode.EditButtonComponent, handleEditObject: handleEditSection, handleDeleteObject: handleDeleteSection, layout: "horizontal", sectionRepository: sectionNode.repository }),
            sectionNode.AddNewButtonComponent && (react_1.default.createElement(sectionNode.AddNewButtonComponent, { modalProps: {
                    onAddNew: handleAddSection,
                    contextData: sectionNode.dataItem,
                } })))) : null));
}
function SectionBody({ sectionNode, resulsetTableProps, onClick, }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        sectionNode.children.map((childNode, index) => (react_1.default.createElement(Section, { key: childNode.dataItem.id + childNode.type, sectionNode: childNode, resulsetTableProps: resulsetTableProps, onClick: onClick }))),
        sectionNode.leaves && (react_1.default.createElement(ResultSetTable_1.ResultSetTable, { ...resulsetTableProps, filteredObjects: sectionNode.leaves }))));
}
