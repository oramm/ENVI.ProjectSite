"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// LatestNews.tsx
const react_1 = __importDefault(require("react"));
const Card_1 = __importDefault(require("react-bootstrap/Card"));
const ListGroup_1 = __importDefault(require("react-bootstrap/ListGroup"));
function News() {
    return (react_1.default.createElement(Card_1.default, null,
        react_1.default.createElement(Card_1.default.Header, null, "Nowo\u015Bci w PS"),
        react_1.default.createElement(ListGroup_1.default, { variant: "flush" },
            react_1.default.createElement(ListGroup_1.default.Item, null,
                react_1.default.createElement("a", { target: '_blank', href: 'https://youtu.be/CYdTj3je_s8' }, "Dodano ZNWU")),
            react_1.default.createElement(ListGroup_1.default.Item, null, "Dodano panel g\u0142\u00F3wny"))));
}
exports.default = News;
;
