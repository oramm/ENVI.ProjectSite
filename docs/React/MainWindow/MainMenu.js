"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const MainSetupReact_1 = __importDefault(require("../MainSetupReact"));
function MainMenu() {
    const location = (0, react_router_dom_1.useLocation)();
    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Navbar, { sticky: "top", bg: "light", expand: "md" },
            react_1.default.createElement(react_bootstrap_1.Container, null,
                react_1.default.createElement(react_bootstrap_1.Navbar.Brand, { as: react_router_dom_1.Link, to: "/" }, "Witryna Projekt\u00F3w"),
                react_1.default.createElement(react_bootstrap_1.Navbar.Toggle, { "aria-controls": "basic-navbar-nav" }),
                react_1.default.createElement(react_bootstrap_1.Navbar.Collapse, { id: "basic-navbar-nav" },
                    react_1.default.createElement(react_bootstrap_1.Nav, { className: "me-auto" },
                        react_1.default.createElement(react_bootstrap_1.NavDropdown, { title: "Kontrakty", id: "basic-nav-dropdown", className: isActive("/contracts") },
                            react_1.default.createElement(react_bootstrap_1.NavDropdown.Item, { as: react_router_dom_1.Link, to: "/contracts" }, "Wszystkie Kontrakty"),
                            react_1.default.createElement(react_bootstrap_1.NavDropdown.Item, { as: react_router_dom_1.Link, to: "/contracts/znwu" }, "ZNWU")),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/letters", className: isActive("/letters") }, "Pisma"),
                        ["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(MainSetupReact_1.default.currentUser.systemRoleName) && (react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/invoices", className: isActive("/invoices") }, "Faktury")),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/tasksGlobal", className: isActive("/tasksGlobal") }, "Zadania"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/entities", className: isActive("/entities") }, "Podmioty"),
                        react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/persons", className: isActive("/persons") }, "Osoby"),
                        ["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(MainSetupReact_1.default.currentUser.systemRoleName) && (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(react_bootstrap_1.Nav.Link, { as: react_router_dom_1.Link, to: "/admin/cities", className: isActive("/admin/cities") }, "Miasta"),
                            react_1.default.createElement(react_bootstrap_1.NavDropdown, { title: "Oferty", id: "basic-nav-dropdown", className: isActive("/offers") },
                                react_1.default.createElement(react_bootstrap_1.NavDropdown.Item, { as: react_router_dom_1.Link, to: "/offers/list" }, "Oferty"),
                                react_1.default.createElement(react_bootstrap_1.NavDropdown.Item, { as: react_router_dom_1.Link, to: "/offers/letters" }, "Pisma do ofert"))))))))));
}
exports.default = MainMenu;
