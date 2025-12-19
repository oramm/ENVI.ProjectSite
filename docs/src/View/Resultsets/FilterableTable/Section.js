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
const FilterableTableRow_1 = require("./FilterableTableRow");
const ResultSetTable_1 = require("./ResultSetTable");
const ToggleExpandButton_1 = require("./ToggleExpandButton");
require("./FilterableTable.css");
const react_router_dom_1 = require("react-router-dom");
function Section({ sectionNode, resulsetTableProps, onClick, childrenExpandTrigger, }) {
    const { activeSectionId, sections, globalExpandTrigger } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const [isActive, setIsActive] = (0, react_1.useState)(activeSectionId === sectionNode.id);
    const [activeKey, setActiveKey] = (0, react_1.useState)(["0"]);
    const [localExpandTrigger, setLocalExpandTrigger] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        setIsActive(activeSectionId === sectionNode.id);
    }, [activeSectionId, sectionNode.id, sections]);
    (0, react_1.useEffect)(() => {
        if (globalExpandTrigger?.action === "COLLAPSE") {
            setActiveKey([]);
        }
        else if (globalExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [globalExpandTrigger]);
    (0, react_1.useEffect)(() => {
        if (childrenExpandTrigger?.action === "COLLAPSE") {
            setActiveKey([]);
        }
        else if (childrenExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [childrenExpandTrigger]);
    (0, react_1.useEffect)(() => {
        // Local trigger: COLLAPSE zwija tylko dzieci (bez bieżącej sekcji), EXPAND rozwija siebie i dzieci
        if (localExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [localExpandTrigger]);
    return sectionNode.isInAccordion ? (react_1.default.createElement(react_bootstrap_1.Accordion, { className: "mb-2", key: sectionNode.id, alwaysOpen: true, activeKey: activeKey, onSelect: (e) => setActiveKey(e) },
        react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: "0" },
            react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isActive: isActive, onClick: onClick, localExpandTrigger: localExpandTrigger, setLocalExpandTrigger: setLocalExpandTrigger })),
            react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick, localExpandTrigger: localExpandTrigger }))))) : (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isActive: isActive, onClick: onClick, localExpandTrigger: localExpandTrigger, setLocalExpandTrigger: setLocalExpandTrigger }),
        react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick, localExpandTrigger: localExpandTrigger })));
}
exports.Section = Section;
function SectionHeader({ sectionNode, onClick, isActive, localExpandTrigger, setLocalExpandTrigger, }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { handleDeleteSection, handleEditSection, handleAddSection } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { selectedObjectRoute, dataItem } = sectionNode;
    function makeTitleStyle() {
        const nodeLevel = sectionNode.level;
        return {
            fontSize: nodeLevel === 1 ? "1.5rem" : "1rem",
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(50, 130, 50)`,
        };
    }
    const headerStyle = {
        backgroundColor: "aliceblue",
        borderRadius: "0.25rem",
    };
    return (react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center flex-wrap w-100 px-2 py-1 mb-2", style: !sectionNode.isInAccordion ? headerStyle : undefined, onClick: () => onClick(sectionNode), onDoubleClick: () => {
            if (selectedObjectRoute)
                navigate(selectedObjectRoute + dataItem.id);
        } },
        react_1.default.createElement("div", { className: "d-flex align-items-center gap-2", style: { cursor: "pointer" } },
            react_1.default.createElement("span", { style: makeTitleStyle() }, sectionNode.titleLabel),
            (sectionNode.leaves?.length || sectionNode.children.length) > 5 && (react_1.default.createElement("span", { className: "tekst-muted small" },
                "[",
                sectionNode.leaves?.length || sectionNode.children.length,
                " pozycji]"))),
        isActive && (react_1.default.createElement("div", { className: "d-flex align-items-center gap-2 section-action-menu" },
            sectionNode.children.length > 0 && (react_1.default.createElement(ToggleExpandButton_1.ToggleExpandButton, { expandTrigger: localExpandTrigger, setExpandTrigger: setLocalExpandTrigger, collapseTitle: "Zwi\u0144 dzieci", expandTitle: "Rozwi\u0144 dzieci", stopPropagation: true })),
            react_1.default.createElement(FilterableTableRow_1.RowActionMenu, { dataObject: sectionNode.dataItem, isDeletable: !!sectionNode.isDeletable, EditButtonComponent: sectionNode.EditButtonComponent, handleEditObject: handleEditSection, handleDeleteObject: handleDeleteSection, shouldRetrieveDataBeforeEdit: sectionNode.shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute: sectionNode.specialRetrieveActionRoute, layout: "horizontal", sectionRepository: sectionNode.repository }),
            sectionNode.AddNewButtonComponent && (react_1.default.createElement(sectionNode.AddNewButtonComponent, { modalProps: {
                    onAddNew: handleAddSection,
                    contextData: sectionNode.dataItem,
                } }))))));
}
function SectionBody({ sectionNode, resulsetTableProps, onClick, localExpandTrigger, }) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        sectionNode.children.map((childNode, index) => (react_1.default.createElement(Section, { key: childNode.dataItem.id + childNode.type, sectionNode: childNode, resulsetTableProps: resulsetTableProps, onClick: onClick, childrenExpandTrigger: localExpandTrigger }))),
        sectionNode.leaves && (react_1.default.createElement(ResultSetTable_1.ResultSetTable, { ...resulsetTableProps, filteredObjects: sectionNode.leaves }))));
}
