import { ErrorServerResponse } from "../../../Typings/bussinesTypes";
import MainSetup from "../MainSetupReact";

export default class ToolsFetch {
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
            const errorData = {
                error: error instanceof Error ? error.message + "\n\n" + error.stack : String(error),
                url: window.location.href,
                timestamp: new Date().toISOString(),
                additionalData: {
                    ...additionalData,
                    userAgent: navigator.userAgent,
                    repositoryName: additionalData?.repositoryName,
                    action: additionalData?.action,
                },
            };

            await fetch(MainSetup.serverUrl + "client-error", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(errorData),
            });

            console.log("Raport błędu klienta został wysłany na serwer");
        } catch (reportError) {
            console.error("Nie udało się wysłać raportu błędu klienta:", reportError);
        }
    }
}
