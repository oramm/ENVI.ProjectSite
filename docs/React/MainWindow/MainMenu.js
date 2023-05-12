"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
function MainMenu() {
    const location = (0, react_router_dom_1.useLocation)();
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Navbar, { sticky: 'top', bg: "light", expand: "md" },
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Navbar.Brand, null, "Witryna Projekt\u00F3w"),
                react_1.default.createElement(react_bootstrap_1.Navbar.Toggle, { "aria-controls": "basic-navbar-nav" }),
                react_1.default.createElement(react_bootstrap_1.Navbar.Collapse, { id: "basic-navbar-nav" },
                    react_1.default.createElement(react_bootstrap_1.Nav, { className: "me-auto" },
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/", className: isActive('/') }, "Strona g\u0142\u00F3wna"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/contracts", className: isActive('/contracts') }, "Kontrakty"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/letters", className: isActive('/letters') }, "Pisma")))))));
}
exports.default = MainMenu;
