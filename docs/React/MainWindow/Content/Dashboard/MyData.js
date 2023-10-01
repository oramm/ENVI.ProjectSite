"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// MyDataCard.tsx
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
function MyData() {
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Moje Dane"),
            react_1.default.createElement(react_bootstrap_1.Card.Text, null,
                react_1.default.createElement("div", null, MainSetupReact_1.default.currentUser.userName),
                react_1.default.createElement("div", null, MainSetupReact_1.default.currentUser.systemEmail),
                react_1.default.createElement("div", null, MainSetupReact_1.default.currentUser.systemRoleName)))));
}
exports.default = MyData;
