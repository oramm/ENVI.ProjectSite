import MainSetup from "../MainSetupReact";

interface ClientErrorPayload {
    message: string;
    stack?: string;
    path: string;
    route: string;
    userAgent?: string;
    statusCode?: number;
    tags?: string[];
}

let isInstalled = false;
let lastSentAt = 0;
let lastSignature = "";
const DEDUPE_WINDOW_MS = 3000;

function getClientErrorSecret(): string | null {
    const runtimeSecret = (window as any).__BUG_CLIENT_ERROR_SECRET__;
    if (typeof runtimeSecret === "string" && runtimeSecret.trim().length > 0) {
        return runtimeSecret.trim();
    }

    const fromStorage = window.localStorage.getItem("BUG_CLIENT_ERROR_SECRET");
    if (typeof fromStorage === "string" && fromStorage.trim().length > 0) {
        return fromStorage.trim();
    }

    return null;
}

function shouldDedupe(payload: ClientErrorPayload): boolean {
    const signature = `${payload.message}|${payload.stack || ""}|${payload.route}`;
    const now = Date.now();

    if (signature === lastSignature && now - lastSentAt < DEDUPE_WINDOW_MS) {
        return true;
    }

    lastSignature = signature;
    lastSentAt = now;
    return false;
}

async function sendClientError(payload: ClientErrorPayload): Promise<void> {
    const secret = getClientErrorSecret();
    if (shouldDedupe(payload)) {
        return;
    }

    const endpoint = new URL("client-error", MainSetup.serverUrl).toString();

    try {
        const headers: Record<string, string> = {
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
    } catch {
        // Intentionally ignored; reporting must never break app flow.
    }
}

function makeBasePayload(message: string, stack?: string): ClientErrorPayload {
    return {
        message,
        stack,
        path: window.location.pathname,
        route: window.location.hash || window.location.pathname,
        userAgent: window.navigator.userAgent,
        tags: ["frontend", "global-handler"],
    };
}

export function installClientErrorReporter(): void {
    if (isInstalled) {
        return;
    }

    isInstalled = true;

    window.addEventListener("error", (event: ErrorEvent) => {
        const errorMessage = event.error?.message || event.message || "Unknown frontend error";
        const errorStack = event.error?.stack;

        void sendClientError(makeBasePayload(errorMessage, errorStack));
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
        const reason = event.reason;

        if (reason instanceof Error) {
            void sendClientError(makeBasePayload(reason.message, reason.stack));
            return;
        }

        const message =
            typeof reason === "string"
                ? reason
                : `Unhandled rejection: ${JSON.stringify(reason || {})}`;

        void sendClientError(makeBasePayload(message));
    });
}
