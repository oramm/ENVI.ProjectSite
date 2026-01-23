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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorBoundary;
const react_1 = __importStar(require("react"));
const defaultFallback = react_1.default.createElement("h1", null, "Wyst\u0105pi\u0142 b\u0142\u0105d.");
function reducer(state, action) {
    switch (action.type) {
        case "SET_ERROR":
            return { error: action.payload };
        case "RESET_ERROR":
            return { error: null };
        default:
            return state;
    }
}
function ErrorBoundary({ children, fallback = defaultFallback }) {
    const [{ error }, dispatch] = (0, react_1.useReducer)(reducer, { error: null });
    (0, react_1.useEffect)(() => {
        if (error)
            console.error(error);
    }, [error]);
    (0, react_1.useEffect)(() => {
        const handleUncaughtError = (e) => {
            dispatch({ type: "SET_ERROR", payload: e.error });
        };
        window.addEventListener("error", handleUncaughtError);
        return () => window.removeEventListener("error", handleUncaughtError);
    }, []);
    if (error) {
        return (react_1.default.createElement("div", null,
            fallback,
            react_1.default.createElement("button", { onClick: () => dispatch({ type: "RESET_ERROR" }) }, "Spr\u00F3buj ponownie")));
    }
    return react_1.default.createElement(react_1.default.Fragment, null, children);
}
