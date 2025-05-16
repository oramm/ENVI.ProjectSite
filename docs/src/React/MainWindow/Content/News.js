"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// News.tsx
const react_1 = __importDefault(require("react"));
const Card_1 = __importDefault(require("react-bootstrap/Card"));
const ListGroup_1 = __importDefault(require("react-bootstrap/ListGroup"));
function News({ title = "Nowości w PS", className, style, items = ["Dodano ZNWU", "Dodano panel główny"], }) {
    return (react_1.default.createElement(Card_1.default, { className: className, style: style },
        react_1.default.createElement(Card_1.default.Header, null, title),
        react_1.default.createElement(ListGroup_1.default, { variant: "flush" }, items.map((item, index) => (react_1.default.createElement(ListGroup_1.default.Item, { key: index }, item))))));
}
exports.default = News;
