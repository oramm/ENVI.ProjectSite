"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleExpandButton = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
function ToggleExpandButton({ expandTrigger, setExpandTrigger, collapseTitle = "Zwiń wszystko", expandTitle = "Rozwiń wszystko", className = "d-flex align-items-center justify-content-center me-2", stopPropagation = false, }) {
    const isCollapsed = expandTrigger?.action === "COLLAPSE";
    return (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", className: className, onClick: (e) => {
            if (stopPropagation)
                e.stopPropagation();
            setExpandTrigger({
                action: isCollapsed ? "EXPAND" : "COLLAPSE",
                id: Date.now(),
            });
        }, title: isCollapsed ? expandTitle : collapseTitle },
        react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: isCollapsed ? free_solid_svg_icons_1.faAngleDoubleDown : free_solid_svg_icons_1.faAngleDoubleUp })));
}
exports.ToggleExpandButton = ToggleExpandButton;
