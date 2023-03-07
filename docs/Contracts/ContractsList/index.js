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
const react_bootstrap_1 = require("react-bootstrap");
function Resultset({ title, filters }) {
    const [objects, setObjects] = (0, react_1.useState)([]);
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement("h1", null, title))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(FilterPanel, { filters: filters }))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, null, objects.length > 0 && (react_1.default.createElement(Table, { objects: objects }))))));
    function FilterPanel({ filters }) {
        return (react_1.default.createElement(react_bootstrap_1.Form, { method: "POST", onSubmit: handleSubmit },
            react_1.default.createElement(react_bootstrap_1.Row, null, filters.map((filter, index) => (react_1.default.createElement(react_bootstrap_1.Col, { key: index }, filter)))),
            react_1.default.createElement(react_bootstrap_1.Button, { type: "submit" }, "Szukaj")));
    }
    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';
        try {
            const response = await fetch(serverUrl + 'contracts', {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            setObjects(data);
            console.log(data);
        }
        catch (error) {
            console.error(error);
        }
    }
    ;
    function Table({ objects }) {
        return (react_1.default.createElement("table", null,
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", null, "Column 1"),
                    react_1.default.createElement("th", null, "Column 2"),
                    react_1.default.createElement("th", null, "Column 3"))),
            react_1.default.createElement("tbody", null, objects.map((object, index) => (react_1.default.createElement("tr", { key: index },
                react_1.default.createElement("td", null, object.id),
                react_1.default.createElement("td", null, object.ourId),
                react_1.default.createElement("td", null, object.name)))))));
    }
}
exports.default = Resultset;
const filters = [
    react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Text Input"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Enter text" })),
    react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Date Input"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", defaultValue: 2010 - 12 - 12 })),
    react_1.default.createElement(react_bootstrap_1.Form.Group, null,
        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Select Option"),
        react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "select" },
            react_1.default.createElement("option", null, "Option 1"),
            react_1.default.createElement("option", null, "Option 2"),
            react_1.default.createElement("option", null, "Option 3")))
];
const root = document.getElementById("root");
if (root)
    client_1.default.createRoot(root).render(react_1.default.createElement(Resultset, { title: "Lista kontraktów", filters: filters }));
