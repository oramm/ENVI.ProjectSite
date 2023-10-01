"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const Dashboard_1 = __importDefault(require("./Dashboard/Dashboard"));
const MyData_1 = __importDefault(require("./Dashboard/MyData"));
const News_1 = __importDefault(require("./News"));
function MainContent() {
    return (react_1.default.createElement("div", { className: "pt-4 bg-light" },
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: 9 },
                    react_1.default.createElement(Dashboard_1.default, null)),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                    react_1.default.createElement("div", { className: 'mb-3' },
                        react_1.default.createElement(MyData_1.default, null)),
                    react_1.default.createElement(News_1.default, null))))));
}
exports.default = MainContent;
;
