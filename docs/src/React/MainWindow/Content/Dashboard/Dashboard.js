"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const UpcomingEvents_1 = __importDefault(require("./UpcomingEvents"));
const MyData_1 = __importDefault(require("./MyData"));
const News_1 = __importDefault(require("../News"));
function Dashboard() {
    return (react_1.default.createElement(react_bootstrap_1.Row, { className: "mx-3" },
        react_1.default.createElement(react_bootstrap_1.Col, { md: 2, className: "mb-3" }),
        react_1.default.createElement(react_bootstrap_1.Col, { md: 8, className: "mb-3" },
            react_1.default.createElement(UpcomingEvents_1.default, null)),
        react_1.default.createElement(react_bootstrap_1.Col, { md: 2, className: "mb-3" },
            react_1.default.createElement(MyData_1.default, { className: "mb-3 bg-white" }),
            react_1.default.createElement(News_1.default, { className: "mb-3 bg-white" }))));
}
exports.default = Dashboard;
