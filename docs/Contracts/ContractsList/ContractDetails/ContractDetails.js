"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDetailsTabs = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
function ContractDetailsTabs() {
    return (react_1.default.createElement(react_bootstrap_1.Tabs, { defaultActiveKey: "general", id: "uncontrolled-tab-example", fill: true },
        react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "general", title: "General" },
            react_1.default.createElement("h1", null, "Szczeg\u00F3\u0142y umowy")),
        react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: "tasks", title: "Tasks" },
            react_1.default.createElement("h1", null, "Tasks"))));
}
exports.ContractDetailsTabs = ContractDetailsTabs;
;
