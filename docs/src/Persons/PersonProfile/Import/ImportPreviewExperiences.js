"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ImportPreviewExperiences;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ToolsDate_1 = __importDefault(require("../../../React/Tools/ToolsDate"));
function ImportPreviewExperiences({ items, selectedIds, onToggle }) {
    if (items.length === 0)
        return null;
    return (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("h6", null,
            "Doswiadczenie (",
            items.length,
            ")"),
        react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true, hover: true },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", { style: { width: 30 } }),
                    react_1.default.createElement("th", null, "Organizacja"),
                    react_1.default.createElement("th", null, "Stanowisko"),
                    react_1.default.createElement("th", null, "Od"),
                    react_1.default.createElement("th", null, "Do"))),
            react_1.default.createElement("tbody", null, items.map((item) => (react_1.default.createElement("tr", { key: item._tempId },
                react_1.default.createElement("td", { className: "text-center" },
                    react_1.default.createElement(react_bootstrap_1.Form.Check, { checked: selectedIds.has(item._tempId), onChange: () => onToggle(item._tempId) })),
                react_1.default.createElement("td", null, item.organizationName || "-"),
                react_1.default.createElement("td", null, item.positionName || "-"),
                react_1.default.createElement("td", null, item.dateFrom
                    ? ToolsDate_1.default.dateISOToDMY(item.dateFrom)
                    : react_1.default.createElement("span", { className: "text-warning small", title: "Brak daty \u2013 wpis zostanie zaimportowany bez daty" }, "\u26A0 brak")),
                react_1.default.createElement("td", null, item.isCurrent
                    ? "aktualnie"
                    : item.dateTo
                        ? ToolsDate_1.default.dateISOToDMY(item.dateTo)
                        : "-"))))))));
}
