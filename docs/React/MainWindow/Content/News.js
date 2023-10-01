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
        react_1.default.createElement(Card_1.default.Header, null, "Najnowsze Wiadomo\u015Bci"),
        react_1.default.createElement(ListGroup_1.default, { variant: "flush" },
            react_1.default.createElement(ListGroup_1.default.Item, null, "Wiadomo\u015B\u0107 1"),
            react_1.default.createElement(ListGroup_1.default.Item, null, "Wiadomo\u015B\u0107 2"),
            react_1.default.createElement(ListGroup_1.default.Item, null, "Wiadomo\u015B\u0107 3"),
            react_1.default.createElement(ListGroup_1.default.Item, null, "Wiadomo\u015B\u0107 4"))));
}
exports.default = News;
;
