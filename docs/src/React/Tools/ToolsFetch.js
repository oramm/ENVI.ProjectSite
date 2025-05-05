"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToolsFetch {
    static async fetchJsonWithSafeError(url, options = {}, customErrorMsg) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(errorDetails.errorMessage);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof TypeError) {
                throw new Error(customErrorMsg || `Brak połączenia z serwerem, sprawdź połączenie internetowe`);
            }
            else if (error instanceof Error) {
                throw new Error(customErrorMsg || error.message);
            }
            else {
                throw new Error(customErrorMsg || `Nieznany błąd klienta`);
            }
        }
    }
    /** Funkcja pomocnicza do ponawiania żądań */
    static async fetchWithRetry(url, options, retries = 3, delay = 1000, customErrorMsg) {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchJsonWithSafeError(url, options, customErrorMsg);
            }
            catch (error) {
                if (i < retries - 1)
                    await sleep(delay);
                else
                    throw error;
            }
        }
    }
}
exports.default = ToolsFetch;
