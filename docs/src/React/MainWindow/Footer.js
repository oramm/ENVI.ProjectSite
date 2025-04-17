"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const Footer = () => {
    return (react_1.default.createElement(react_bootstrap_1.Navbar, { bg: "light", className: "mt-auto" },
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center w-100" },
                react_1.default.createElement(react_bootstrap_1.Col, null,
                    react_1.default.createElement(react_bootstrap_1.Navbar.Text, null,
                        "\u00A9 ",
                        new Date().getFullYear(),
                        " ENVI Konsulting")),
                react_1.default.createElement(react_bootstrap_1.Col, { className: "text-end" },
                    react_1.default.createElement(react_bootstrap_1.Navbar.Text, null,
                        react_1.default.createElement("a", { href: "https://www.envi.com.pl", target: "_blank", rel: "noreferrer", style: { textDecoration: "none" } }, "www.envi.com.pl")))))));
};
exports.default = Footer;
