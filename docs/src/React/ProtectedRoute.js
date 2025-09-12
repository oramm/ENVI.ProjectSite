"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
const ProtectedRoute = ({ allowedRoles }) => {
    const currentUser = MainSetupReact_1.default.currentUser;
    if (!currentUser) {
        return react_1.default.createElement(react_router_dom_1.Navigate, { to: "/", replace: true });
    }
    const isAuthorized = allowedRoles.includes(currentUser.systemRoleName);
    if (!isAuthorized) {
        console.warn(`Access denied for user ${currentUser.userName}. Required roles: ${allowedRoles.join(', ')}`);
        return react_1.default.createElement(react_router_dom_1.Navigate, { to: "/", replace: true });
    }
    return react_1.default.createElement(react_router_dom_1.Outlet, null);
};
exports.default = ProtectedRoute;
