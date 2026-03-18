import { ErrorServerResponse } from "../../../Typings/bussinesTypes";
import MainSetup from "../MainSetupReact";

export default class ToolsFetch {
    private static getClientErrorSecret(): string | null {
        const runtimeSecret = (window as any).__BUG_CLIENT_ERROR_SECRET__;
        if (typeof runtimeSecret === "string" && runtimeSecret.trim().length > 0) {
            return runtimeSecret.trim();
        }

        const storageSecret = window.localStorage.getItem("BUG_CLIENT_ERROR_SECRET");
        if (typeof storageSecret === "string" && storageSecret.trim().length > 0) {
            return storageSecret.trim();
        }

        return null;
    }

    static async fetchJsonWithSafeError(url: string, options: RequestInit = {}, customErrorMsg?: string) {
        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorDetails: ErrorServerResponse = await response.json();
                throw new Error(errorDetails.errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error(customErrorMsg || `Brak połączenia z serwerem, sprawdź połączenie internetowe`);
            } else if (error instanceof Error) {
                throw new Error(customErrorMsg || error.message);
            } else {
                throw new Error(customErrorMsg || `Nieznany błąd klienta`);
            }
        }
    }

    /** Funkcja pomocnicza do ponawiania żądań */
    static async fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000, customErrorMsg?: string) {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchJsonWithSafeError(url, options, customErrorMsg);
            } catch (error) {
                if (i < retries - 1) await sleep(delay);
                else throw error;
            }
        }
    }

    /**
     * Wysyła raport błędu klienta na serwer
     * @param error - błąd do zgłoszenia
     * @param additionalData - dodatkowe dane kontekstowe
     */
    static async sendClientErrorReport(error: unknown, additionalData?: any) {
        try {
            const secret = this.getClientErrorSecret();

            const message = error instanceof Error ? error.message : String(error || "Unknown client error");
            const stack = error instanceof Error ? error.stack : undefined;

            const errorData = {
                message,
                stack,
                path: window.location.pathname,
                route: window.location.hash || window.location.pathname,
                userAgent: navigator.userAgent,
                tags: ["frontend", "repository"],
                statusCode: 500,
                context: {
                    repositoryName: additionalData?.repositoryName,
                    action: additionalData?.action,
                    details: additionalData,
                },
            };

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (secret) {
                headers["x-client-error-secret"] = secret;
            }

            await fetch(MainSetup.serverUrl + "client-error", {
                method: "POST",
                headers,
                credentials: "include",
                body: JSON.stringify(errorData),
            });

            console.log("Raport błędu klienta został wysłany na serwer");
        } catch (reportError) {
            console.error("Nie udało się wysłać raportu błędu klienta:", reportError);
        }
    }
}
