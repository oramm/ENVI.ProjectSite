"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// MyTasksCard.tsx
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
function MyTasks() {
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Moje Zadania"),
            react_1.default.createElement(react_bootstrap_1.Card.Text, null, "Here you can display a list or summary of the user's tasks."))));
}
exports.default = MyTasks;
