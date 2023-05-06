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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
function MainMenu() {
    const [showOffcanvas, setShowOffcanvas] = (0, react_1.useState)(false);
    const location = (0, react_router_dom_1.useLocation)();
    const handleShowOffcanvas = () => setShowOffcanvas(true);
    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Navbar, { sticky: 'top', bg: "light", expand: "lg" },
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Navbar.Brand, null, "Witryna Projekt\u00F3w"),
                react_1.default.createElement(react_bootstrap_1.Navbar.Toggle, { "aria-controls": "basic-navbar-nav" }),
                react_1.default.createElement(react_bootstrap_1.Navbar.Collapse, { id: "basic-navbar-nav" },
                    react_1.default.createElement(react_bootstrap_1.Nav, { className: "me-auto" },
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/", className: isActive('/'), onClick: handleCloseOffcanvas }, "Strona g\u0142\u00F3wna"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/contracts", className: isActive('/contracts'), onClick: handleCloseOffcanvas }, "Kontrakty"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/letters", className: isActive('/letters'), onClick: handleCloseOffcanvas }, "Pisma")),
                    react_1.default.createElement(react_bootstrap_1.Button, { className: "d-lg-none", onClick: handleShowOffcanvas }, "Offcanvas menu")))),
        react_1.default.createElement(react_bootstrap_1.Offcanvas, { show: showOffcanvas, onHide: handleCloseOffcanvas },
            react_1.default.createElement(react_bootstrap_1.Offcanvas.Header, { closeButton: true },
                react_1.default.createElement(react_bootstrap_1.Offcanvas.Title, null, "Menu")),
            react_1.default.createElement(react_bootstrap_1.Offcanvas.Body, null,
                react_1.default.createElement(react_bootstrap_1.Nav, { className: "flex-column" },
                    react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/", className: isActive('/'), onClick: handleCloseOffcanvas }, "Strona g\u0142\u00F3wna"),
                    react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/pageone", className: isActive('/pageone'), onClick: handleCloseOffcanvas }, "Strona 1"),
                    react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/pagetwo", className: isActive('/pagetwo'), onClick: handleCloseOffcanvas }, "Strona 2"))))));
}
exports.default = MainMenu;
