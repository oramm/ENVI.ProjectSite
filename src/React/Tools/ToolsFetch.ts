import { ErrorServerResponse } from "../../../Typings/bussinesTypes";

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
}
