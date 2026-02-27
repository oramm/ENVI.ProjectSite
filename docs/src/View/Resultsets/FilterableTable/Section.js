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
exports.Section = Section;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
require("./FilterableTable.css");
const FilterableTableContext_1 = require("./FilterableTableContext");
const FilterableTableRow_1 = require("./FilterableTableRow");
const ResultSetTable_1 = require("./ResultSetTable");
const ToggleExpandButton_1 = require("./ToggleExpandButton");
const ToolsRouting_1 = require("../../../React/Tools/ToolsRouting");
function Section({ sectionNode, resulsetTableProps, onClick, childrenExpandTrigger, }) {
    const { activePathSet, editingSectionId, sections, globalExpandTrigger } = (0, FilterableTableContext_1.useFilterableTableContext)();
    // Tło: czy sekcja jest na ścieżce od korzenia do aktywnej
    const isOnActivePath = activePathSet.has(sectionNode.id);
    // Menu: czy to jest aktualnie edytowana sekcja
    const isEditing = editingSectionId === sectionNode.id;
    const [activeKey, setActiveKey] = (0, react_1.useState)(["0"]);
    const [localExpandTrigger, setLocalExpandTrigger] = (0, react_1.useState)(null);
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
    // Obliczanie klas dla kontenera Accordion (karta vs zwykły)
    const hasCustomBorder = !!sectionNode.borderColor;
    const accordionClassName = hasCustomBorder ? "mb-4 section-accordion section-card" : "mb-2 section-accordion";
    return sectionNode.isInAccordion ? (react_1.default.createElement(react_bootstrap_1.Accordion, { className: accordionClassName, style: hasCustomBorder ? { borderLeftColor: sectionNode.borderColor } : undefined, key: sectionNode.id, alwaysOpen: true, activeKey: activeKey, onSelect: (e) => setActiveKey(e) },
        react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: "0" },
            react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isOnActivePath: isOnActivePath, isEditing: isEditing, onClick: onClick, localExpandTrigger: localExpandTrigger, setLocalExpandTrigger: setLocalExpandTrigger })),
            react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick, localExpandTrigger: localExpandTrigger }))))) : (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(SectionHeader, { sectionNode: sectionNode, isOnActivePath: isOnActivePath, isEditing: isEditing, onClick: onClick, localExpandTrigger: localExpandTrigger, setLocalExpandTrigger: setLocalExpandTrigger }),
        react_1.default.createElement(SectionBody, { resulsetTableProps: resulsetTableProps, sectionNode: sectionNode, onClick: onClick, localExpandTrigger: localExpandTrigger })));
}
function SectionHeader({ sectionNode, onClick, isOnActivePath, isEditing, localExpandTrigger, setLocalExpandTrigger, }) {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { handleDeleteSection, handleEditSection, handleAddSection } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const { selectedObjectRoute, dataItem } = sectionNode;
    function makeTitleStyle() {
        const nodeLevel = sectionNode.level;
        return {
            fontSize: nodeLevel === 1 ? "1.5rem" : "1rem",
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(50, 130, 50)`,
            textTransform: "none",
        };
    }
    const hasCustomBorder = !!sectionNode.borderColor;
    const isAccordionChild = !!sectionNode.isInAccordion;
    // Base classes
    let computedClassName = `
        d-flex
        flex-column flex-md-row
        justify-content-md-between
        align-items-start align-items-md-center
        w-100
        transition-base
        section-header
    `;
    // Apply specific variants
    if (hasCustomBorder) {
        // "Card Header" style - clean, large padding, transparent base
        computedClassName += " p-3";
    }
    else {
        // "Default Header" style - smaller padding
        computedClassName += " px-2 py-1 rounded";
    }
    // Active & Hover states (Colors)
    // Tło: podświetlone dla wszystkich sekcji na ścieżce od korzenia
    if (isOnActivePath) {
        computedClassName += " state-active";
    }
    else {
        computedClassName += " state-hover";
    }
    return (react_1.default.createElement("div", { className: computedClassName, onClick: () => onClick(sectionNode), onDoubleClick: () => {
            if (!selectedObjectRoute)
                return;
            const target = (0, ToolsRouting_1.buildDetailsPath)(selectedObjectRoute, dataItem.id);
            if (target)
                navigate(target);
        } },
        react_1.default.createElement("div", { className: "\n                            d-flex\n                            align-items-center\n                            gap-2\n                            flex-grow-1\n                            min-w-0\n                        ", style: { cursor: "pointer" } },
            react_1.default.createElement("div", { style: makeTitleStyle(), className: "flex-grow-1 text-break" }, sectionNode.title),
            (sectionNode.leaves?.length || sectionNode.children.length) > 5 && (react_1.default.createElement("span", { className: "text-muted small flex-shrink-0" },
                "[",
                sectionNode.leaves?.length || sectionNode.children.length,
                " pozycji]"))),
        isEditing && (react_1.default.createElement("div", { className: "\n                                d-flex\n                                align-items-center\n                                gap-2\n                                \n                                flex-shrink-0\n                                mt-2 mt-md-0\n                            " },
            sectionNode.children.length > 0 && (react_1.default.createElement(ToggleExpandButton_1.ToggleExpandButton, { expandTrigger: localExpandTrigger, setExpandTrigger: setLocalExpandTrigger, collapseTitle: "Zwi\u0144 dzieci", expandTitle: "Rozwi\u0144 dzieci", stopPropagation: true })),
            react_1.default.createElement(FilterableTableRow_1.RowActionMenu, { dataObject: sectionNode.dataItem, isDeletable: !!sectionNode.isDeletable, EditButtonComponent: sectionNode.EditButtonComponent, handleEditObject: handleEditSection, handleDeleteObject: handleDeleteSection, shouldRetrieveDataBeforeEdit: sectionNode.shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute: sectionNode.specialRetrieveActionRoute, layout: "horizontal", sectionRepository: sectionNode.repository }),
            sectionNode.AddNewButtonComponent && (react_1.default.createElement(sectionNode.AddNewButtonComponent, { modalProps: {
                    onAddNew: handleAddSection,
                    contextData: sectionNode.dataItem,
                } }))))));
}
// Jeśli karta (border), padding w body musi być dopasowany do stylistyki
function SectionBody({ sectionNode, resulsetTableProps, onClick, localExpandTrigger, }) {
    const hasCustomBorder = !!sectionNode.borderColor;
    // KONTRAKTY (Karty): Padding ramki dla całej zawartości
    const cardContentStyle = hasCustomBorder ? { padding: "0 1rem 1rem 1rem" } : {};
    // ZAGNIEŻDŻONE SEKCJE: Wcięcie (indentation) TYLKO dla dzieci (nested sections), NIE dla liści (tabeli tasków)
    const indentationStyle = !hasCustomBorder ? { paddingLeft: "1.5rem" } : {};
    return (react_1.default.createElement("div", { style: cardContentStyle },
        sectionNode.children.length > 0 && (react_1.default.createElement("div", { style: indentationStyle }, sectionNode.children.map((childNode, index) => (react_1.default.createElement(Section, { key: childNode.dataItem.id + childNode.type, sectionNode: childNode, resulsetTableProps: resulsetTableProps, onClick: onClick, childrenExpandTrigger: localExpandTrigger }))))),
        sectionNode.leaves && (react_1.default.createElement("div", { className: "mt-2" },
            react_1.default.createElement(ResultSetTable_1.ResultSetTable, { ...resulsetTableProps, filteredObjects: sectionNode.leaves, parentSectionId: sectionNode.id })))));
}
