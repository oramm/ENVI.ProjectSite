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
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, title),
            react_1.default.createElement("div", null,
                react_1.default.createElement("div", null, userName),
                react_1.default.createElement("div", null, systemEmail),
                react_1.default.createElement("div", null, systemRoleName)),
            renderExtraContent && react_1.default.createElement("div", { className: "mt-2" }, renderExtraContent()))));
}
exports.default = MyData;
