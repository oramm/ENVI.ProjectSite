"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ImportPreviewSkills;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
function ImportPreviewSkills({ items, selectedIds, onToggle }) {
    if (items.length === 0)
        return null;
    return (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("h6", null,
            "Umiejetnosci (",
            items.length,
            ")"),
        react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true, hover: true },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", { style: { width: 30 } }),
                    react_1.default.createElement("th", null, "Nazwa"),
                    react_1.default.createElement("th", null, "Poziom"),
                    react_1.default.createElement("th", null, "Lata"))),
            react_1.default.createElement("tbody", null, items.map((item) => (react_1.default.createElement("tr", { key: item._tempId },
                react_1.default.createElement("td", { className: "text-center" },
                    react_1.default.createElement(react_bootstrap_1.Form.Check, { checked: selectedIds.has(item._tempId), onChange: () => onToggle(item._tempId) })),
                react_1.default.createElement("td", null, item.name),
                react_1.default.createElement("td", null, item.levelCode || "-"),
                react_1.default.createElement("td", null, item.yearsOfExperience != null ? `${item.yearsOfExperience}` : "-"))))))));
}
