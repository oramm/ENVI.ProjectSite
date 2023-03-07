"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
require("./index.css");
const controller_1 = __importDefault(require("./controller"));
//import { Collapse, Button, } from 'react-bootstrap';
function Square({ value, onClick }) {
    return (react_1.default.createElement("button", { className: "square", onClick: onClick }, value));
}
class Board extends react_1.default.Component {
    renderSquare(i) {
        return (react_1.default.createElement(Square, { value: this.props.squares[i], onClick: () => this.props.onClick(i) }));
    }
    rendersingleRow(n) {
        const squares = [];
        for (let i = 0; i <= 2; i++)
            squares.push(this.renderSquare(n * 3 - 3 + i));
        return (react_1.default.createElement("div", { className: 'board-row' }, squares));
    }
    ;
    renderAllRows(rowsCount) {
        const rows = [];
        for (let i = 1; i <= rowsCount; i++)
            rows.push(this.rendersingleRow(i));
        return rows;
    }
    render() {
        return (react_1.default.createElement("div", { className: 'game-board' }, this.renderAllRows(3)));
    }
}
function Game() {
    const [history, setHistory] = (0, react_1.useState)([{ squares: Array(9).fill(null) }]);
    const [isNext, setIsNext] = (0, react_1.useState)(true);
    const [stepNumber, setstepNumber] = (0, react_1.useState)(0);
    const current = history[history.length - 1];
    const winner = controller_1.default.calculateWinner(current.squares);
    let status;
    if (winner)
        status = `Winner: ${winner}`;
    else
        status = `Next player:  ${isNext ? 'X' : 'O'}`;
    return react_1.default.createElement("div", { className: 'game' },
        react_1.default.createElement(Board, { squares: current.squares, onClick: (i) => handleClick(i) }),
        react_1.default.createElement("div", { className: 'game-info' },
            react_1.default.createElement("div", { className: 'status' }, status),
            react_1.default.createElement("ol", null, renderHistory(history))));
    function renderHistory(history) {
        return history.map((step, move) => {
            const desc = move ? 'Go to move #' + move : 'Go to game start';
            return (react_1.default.createElement("li", { key: move },
                react_1.default.createElement("button", { onClick: () => jumpTo(move) }, desc)));
        });
    }
    function jumpTo(step) {
        setstepNumber(step);
        setIsNext((step % 2) === 0);
    }
    function handleClick(i) {
        const current = history[stepNumber];
        const squares = current.squares.slice();
        if (squares[i] || controller_1.default.calculateWinner(squares))
            return;
        squares[i] = isNext ? 'X' : 'O';
        setHistory(history.concat([{ squares }]));
        setIsNext(!isNext);
        setstepNumber(stepNumber + 1);
    }
}
exports.default = Game;
const root = document.getElementById("root");
if (root)
    client_1.default.createRoot(root).render(react_1.default.createElement(Game, null));
