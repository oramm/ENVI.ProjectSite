"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installClientErrorReporter = installClientErrorReporter;
const MainSetupReact_1 = __importDefault(require("../MainSetupReact"));
let isInstalled = false;
let lastSentAt = 0;
let lastSignature = "";
const DEDUPE_WINDOW_MS = 3000;
function getClientErrorSecret() {
    const runtimeSecret = window.__BUG_CLIENT_ERROR_SECRET__;
    if (typeof runtimeSecret === "string" && runtimeSecret.trim().length > 0) {
        return runtimeSecret.trim();
    }
    const fromStorage = window.localStorage.getItem("BUG_CLIENT_ERROR_SECRET");
    if (typeof fromStorage === "string" && fromStorage.trim().length > 0) {
        return fromStorage.trim();
    }
    return null;
}
function shouldDedupe(payload) {
    const signature = `${payload.message}|${payload.stack || ""}|${payload.route}`;
    const now = Date.now();
    if (signature === lastSignature && now - lastSentAt < DEDUPE_WINDOW_MS) {
        return true;
    }
    lastSignature = signature;
    lastSentAt = now;
    return false;
}
async function sendClientError(payload) {
    const secret = getClientErrorSecret();
    if (shouldDedupe(payload)) {
        return;
    }
    const endpoint = new URL("client-error", MainSetupReact_1.default.serverUrl).toString();
    try {
        const headers = {
            "Content-Type": "application/json",
        };
        if (secret) {
            headers["x-client-error-secret"] = secret;
        }
        await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            keepalive: true,
            headers,
            body: JSON.stringify(payload),
        });
    }
    catch {
        // Intentionally ignored; reporting must never break app flow.
    }
}
function makeBasePayload(message, stack) {
    return {
        message,
        stack,
        path: window.location.pathname,
        route: window.location.hash || window.location.pathname,
        userAgent: window.navigator.userAgent,
        tags: ["frontend", "global-handler"],
    };
}
function installClientErrorReporter() {
    if (isInstalled) {
        return;
    }
    isInstalled = true;
    window.addEventListener("error", (event) => {
        const errorMessage = event.error?.message || event.message || "Unknown frontend error";
        const errorStack = event.error?.stack;
        void sendClientError(makeBasePayload(errorMessage, errorStack));
    });
    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        if (reason instanceof Error) {
            void sendClientError(makeBasePayload(reason.message, reason.stack));
            return;
        }
        const message = typeof reason === "string"
            ? reason
            : `Unhandled rejection: ${JSON.stringify(reason || {})}`;
        void sendClientError(makeBasePayload(message));
    });
}
