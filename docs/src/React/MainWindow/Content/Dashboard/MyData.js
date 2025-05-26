"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// MyDataCard.tsx
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
function MyData({ title = "Moje Dane", className, style, renderExtraContent }) {
    const { userName, systemEmail, systemRoleName } = MainSetupReact_1.default.currentUser;
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: className, style: style },
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center mb-2" },
                react_1.default.createElement(react_bootstrap_1.Card.Title, { className: "mb-0", style: { fontWeight: 600, fontSize: 18 } }, title)),
            react_1.default.createElement("div", { className: "mb-2" },
                react_1.default.createElement("div", { className: "d-flex align-items-center mb-1" },
                    react_1.default.createElement("span", { style: { fontSize: 18, marginRight: 8 } }, "\uD83D\uDC64"),
                    react_1.default.createElement("span", { className: "fw-semibold text-secondary small" }, userName)),
                react_1.default.createElement("div", { className: "d-flex align-items-center mb-1" },
                    react_1.default.createElement("span", { style: { fontSize: 18, marginRight: 8 } }, "\u2709\uFE0F"),
                    react_1.default.createElement("span", { className: "text-secondary small" }, systemEmail)),
                react_1.default.createElement("div", { className: "d-flex align-items-center" },
                    react_1.default.createElement("span", { style: { fontSize: 18, marginRight: 8 } }, "\uD83D\uDD11"),
                    react_1.default.createElement("span", { className: "text-secondary small" }, systemRoleName))),
            renderExtraContent && react_1.default.createElement("div", { className: "mt-2" }, renderExtraContent()))));
}
exports.default = MyData;
