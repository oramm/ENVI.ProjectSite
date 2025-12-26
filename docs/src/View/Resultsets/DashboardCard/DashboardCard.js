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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const DashboardCardContext_1 = require("./DashboardCardContext");
const ToolsDate_1 = __importDefault(require("../../../React/Tools/ToolsDate"));
const ToolsRouting_1 = require("../../../React/Tools/ToolsRouting");
const RowActionMenu_1 = __importDefault(require("./RowActionMenu"));
const CommonComponents_1 = require("../CommonComponents");
function DashboardCard({ cardData, dataLoaded, repository, SectionSubtittle, ListItem, EditButtonComponent, isDeletable = true, detailsRoute = "", getDetailsId, initialObjects, onRowClick, shouldRetrieveDataBeforeEdit = false, specialRetrieveActionRoute, className, headerRoute, onEditComplete, processEditedObject, }) {
    const [expandedStatus, setExpandedStatus] = (0, react_1.useState)({});
    const [activeRowId, setActiveRowId] = (0, react_1.useState)(0);
    const [objects, setObjects] = (0, react_1.useState)(initialObjects);
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        setObjects(initialObjects);
    }, [initialObjects]);
    const INITIAL_VISIBLE = 0;
    const dateFrom = cardData.header.daysBeforeToday !== undefined
        ? ToolsDate_1.default.addDays(new Date(), -cardData.header.daysBeforeToday).toISOString().slice(0, 10)
        : null;
    const dateTo = cardData.header.daysAfterToday !== undefined
        ? ToolsDate_1.default.addDays(new Date(), cardData.header.daysAfterToday).toISOString().slice(0, 10)
        : null;
    function handleEditObject(object) {
        const processedObject = processEditedObject ? processEditedObject(object) : object;
        setObjects(objects.map((o) => (o.id === object.id ? processedObject : o)));
    }
    function handleDeleteObject(objectId) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }
    function handleToggle(sectionKey) {
        setExpandedStatus((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    }
    function handleRowClick(id) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        if (onRowClick) {
            onRowClick(repository.currentItems[0]);
        }
    }
    function handleRowDoubleClick(object) {
        const detailsId = getDetailsId ? getDetailsId(object) : object.id;
        if (!detailsRoute)
            return;
        const target = (0, ToolsRouting_1.buildDetailsPath)(detailsRoute, detailsId);
        if (target)
            navigate(target, { state: { repository } });
    }
    function handleHeaderClick() {
        if (headerRoute)
            navigate(headerRoute, { state: { repository } });
    }
    function renderCardTitle() {
        let dateRangeText = "";
        if (dateFrom && dateTo) {
            // Obie daty istnieją - pokaż zakres
            dateRangeText = `${ToolsDate_1.default.dateToDdMmm(dateFrom)} - ${ToolsDate_1.default.dateToDdMmm(dateTo)}`;
        }
        else if (dateFrom) {
            // Tylko data początkowa
            dateRangeText = `od ${ToolsDate_1.default.dateToDdMmm(dateFrom)}`;
        }
        else if (dateTo) {
            // Tylko data końcowa
            dateRangeText = `do ${ToolsDate_1.default.dateToDdMmm(dateTo)}`;
        }
        return (react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center" },
            react_1.default.createElement(react_bootstrap_1.Card.Title, { className: "mb-0", onClick: () => handleHeaderClick(), style: { cursor: "pointer" } }, cardData.header.title),
            dateRangeText && (react_1.default.createElement("span", { style: { fontSize: "0.85em" }, className: "text-secondary" }, dateRangeText))));
    }
    function renderSection(params) {
        const { objectsInSection, expanded, sectionData } = params;
        const visibleData = expanded ? objectsInSection : objectsInSection.slice(0, INITIAL_VISIBLE);
        return (react_1.default.createElement(react_bootstrap_1.ListGroup.Item, { key: sectionData.key, className: "p-0 border-0" },
            react_1.default.createElement("div", { className: `list-group-item-action${expanded ? " bg-primary bg-opacity-10" : ""}`, style: { cursor: "pointer", display: "flex", flexDirection: "column" }, onClick: () => handleToggle(sectionData.key) },
                react_1.default.createElement("div", { className: "d-flex align-items-center justify-content-between w-100" },
                    react_1.default.createElement("span", { className: "d-flex align-items-center flex-grow-1" },
                        react_1.default.createElement("span", { style: { fontSize: 14, width: 14 } }, sectionData.icon),
                        react_1.default.createElement("span", { className: "ms-2 fw-semibold" }, sectionData.label || sectionData.key)),
                    react_1.default.createElement("span", { className: "d-flex align-items-center" },
                        react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark" }, objectsInSection.length),
                        react_1.default.createElement("span", { className: "text-secondary small ms-2", style: { fontSize: "0.9em" } }, expanded ? "▼" : "▸"))),
                SectionSubtittle && (react_1.default.createElement("div", { className: "ms-4 pt-1 small text-secondary" },
                    react_1.default.createElement(SectionSubtittle, { sectionData: sectionData })))),
            react_1.default.createElement("ul", { className: "ps-4 mt-2 mb-2", style: { listStyleType: "none" } }, visibleData.map((object) => renderListItem(object)))));
    }
    function renderListItem(object) {
        const isActive = object.id === activeRowId;
        return (react_1.default.createElement("li", { key: object.id, onClick: () => handleRowClick(object.id), onDoubleClick: () => handleRowDoubleClick(object), className: `mb-2 d-flex align-items-center${isActive ? " bg-primary bg-opacity-10" : ""}`, style: { justifyContent: "space-between" } },
            react_1.default.createElement(ListItem, { object: object }),
            isActive && (react_1.default.createElement("span", { className: "ms-2 d-flex justify-content-end flex-grow-1", style: { minWidth: 0 } },
                react_1.default.createElement(RowActionMenu_1.default, { dataObject: object, handleEditObject: handleEditObject, EditButtonComponent: EditButtonComponent, handleDeleteObject: handleDeleteObject, isDeletable: isDeletable, layout: "horizontal" })))));
    }
    if (!dataLoaded) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, cardData.header.title),
                react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))));
    }
    if (!cardData.sections?.length) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, cardData.header.title),
                react_1.default.createElement("div", { className: "text-secondary" }, "Brak danych do wy\u015Bwietlenia."))));
    }
    return (react_1.default.createElement(DashboardCardContext_1.DashboardCardProvider, { objects: objects, cardData: cardData, activeRowId: activeRowId, repository: repository, handleEditObject: handleEditObject, handleDeleteObject: handleDeleteObject, setObjects: setObjects, selectedObjectRoute: detailsRoute, EditButtonComponent: EditButtonComponent, isDeletable: isDeletable, shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute: specialRetrieveActionRoute },
        react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                renderCardTitle(),
                react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: "flush", className: "mt-3" }, cardData.sections.map((sectionData) => {
                    const objectsInSection = objects.filter((object) => sectionData.key === object[cardData.sectionAttributeName]);
                    if (objectsInSection.length === 0)
                        return null;
                    return renderSection({
                        objectsInSection,
                        sectionData,
                        expanded: expandedStatus[sectionData.key] || false,
                    });
                }))))));
}
exports.default = DashboardCard;
