"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorageManager = void 0;
const ToolsFetch_1 = __importDefault(require("../Tools/ToolsFetch"));
/**
 * Zarządza przechowywaniem danych w sessionStorage z monitoringiem wykorzystania.
 * Zapewnia automatyczne wykrywanie limitów i proaktywne ostrzeżenia.
 */
class SessionStorageManager {
    /**
     * Wykrywa rzeczywisty limit sessionStorage w przeglądarce.
     * Używa zoptymalizowanego binary search z konsekwentnym liczeniem w znakach.
     * UWAGA: Chrome używa UTF-16 encoding (2 bajty na znak).
     */
    static detectStorageLimit() {
        if (this._detectedLimit !== null) {
            return this._detectedLimit;
        }
        const testKey = "__storage_limit_test__";
        const originalValue = sessionStorage.getItem(testKey);
        const currentUsageChars = this.calculateStorageSize();
        try {
            console.log(`🔍 Wykrywanie limitu storage (obecne użycie: ${((currentUsageChars * 2) / 1024 / 1024).toFixed(2)} MB)...`);
            let minChars = 512;
            let maxChars = 5 * 1024 * 1024; // 5M znaków = 10MB
            let detectedLimitChars = 0;
            let iterations = 0;
            const maxIterations = 30;
            while (minChars <= maxChars && iterations < maxIterations) {
                iterations++;
                const testSizeChars = Math.floor((minChars + maxChars) / 2);
                try {
                    // PROSTY TEST - jeden string, jeden setItem
                    const testData = "x".repeat(testSizeChars);
                    sessionStorage.setItem(testKey, testData);
                    const actualTotalCharsAfterSuccess = this.calculateStorageSize();
                    detectedLimitChars = actualTotalCharsAfterSuccess;
                    sessionStorage.removeItem(testKey); // Natychmiastowe usunięcie
                    minChars = testSizeChars + 1;
                }
                catch (error) {
                    // Nie zmieściło się
                    maxChars = testSizeChars - 1;
                }
            }
            // Przywróć oryginalną wartość
            if (originalValue !== null) {
                sessionStorage.setItem(testKey, originalValue);
            }
            if (detectedLimitChars > 0) {
                this._detectedLimit = detectedLimitChars;
                console.log(`🎯 Wykryto limit sessionStorage: ${((detectedLimitChars * 2) / 1024 / 1024).toFixed(2)} MB`);
                return this._detectedLimit;
            }
            else {
                throw new Error(`Nie wykryto limitu sessionStorage po ${iterations} iteracjach`);
            }
        }
        catch (error) {
            console.warn("⚠️ Błąd wykrywania sessionStorage, używam fallback 10MB");
            this._detectedLimit = 5 * 1024 * 1024; // 5M znaków = 10MB
            return this._detectedLimit;
        }
    }
    /**
     * Getter dla aktualnego limitu storage.
     */
    static get STORAGE_LIMIT() {
        return this.detectStorageLimit();
    }
    /**
     * Oblicza rozmiar storage w znakach (nie bajtach).
     */
    static calculateStorageSize() {
        let totalSize = 0;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                const value = sessionStorage.getItem(key);
                if (value !== null) {
                    totalSize += key.length + value.length;
                }
            }
        }
        return totalSize;
    }
    /**
     * Zapisuje dane do sessionStorage z monitoringiem wykorzystania.
     */
    static save(key, data, repositoryName) {
        try {
            const currentStorageSize = this.calculateStorageSize();
            const serializedData = JSON.stringify(data);
            const estimatedSizeAfterSave = currentStorageSize + serializedData.length;
            const storageLimit = this.STORAGE_LIMIT;
            if (estimatedSizeAfterSave > storageLimit * this.WARNING_THRESHOLD) {
                this.makeStorageWarning(repositoryName, currentStorageSize, estimatedSizeAfterSave);
            }
            sessionStorage.setItem(key, serializedData);
            // console.log(
            //     `✅ ${repositoryName}: Dane zapisane (${serializedData.length} znaków, ${(
            //         (estimatedSizeAfterSave / storageLimit) *
            //         100
            //     ).toFixed(1)}% wykorzystania)`
            // );
        }
        catch (error) {
            this.handleStorageError(error, key, repositoryName, data);
        }
    }
    /**
     * Wczytuje dane z sessionStorage.
     */
    static load(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error(`❌ Błąd odczytu z sessionStorage dla klucza ${key}:`, error);
            return null;
        }
    }
    /**
     * Zwraca szczegółowe metryki wykorzystania storage.
     */
    static getMetrics() {
        const totalSize = this.calculateStorageSize();
        const analysis = this.analyzeStorageKeys();
        const storageLimit = this.STORAGE_LIMIT;
        const usagePercentage = (totalSize / storageLimit) * 100;
        return {
            totalSize,
            totalSizeKB: (totalSize * 2) / 1024,
            totalSizeBytes: totalSize * 2,
            usagePercentage,
            storageLimit,
            storageLimitKB: (storageLimit * 2) / 1024,
            storageLimitBytes: storageLimit * 2,
            analysis,
            limitDetection: this.getStorageLimit(),
        };
    }
    /**
     * Usuwa pojedynczy klucz z storage.
     */
    static clear(key) {
        sessionStorage.removeItem(key);
    }
    /**
     * Czyści cały sessionStorage.
     */
    static clearAll() {
        sessionStorage.clear();
    }
    /**
     * Zwraca informacje o wykrytym limicie storage.
     */
    static getStorageLimit() {
        const detected = this._detectedLimit;
        const fallback = 5 * 1024 * 1024; // 5M znaków
        const current = this.STORAGE_LIMIT;
        return {
            detected: detected || fallback,
            detectedMB: ((detected || fallback) * 2) / (1024 * 1024),
            fallback,
            fallbackMB: (fallback * 2) / (1024 * 1024),
            source: detected !== null ? "detected" : "fallback",
        };
    }
    /**
     * Resetuje wykryty limit - zostanie ponownie wykryty przy następnym użyciu.
     */
    static resetDetectedLimit() {
        this._detectedLimit = null;
        console.log("🔄 Reset wykrycia limitu storage - zostanie ponownie wykryty przy następnym użyciu");
    }
    /**
     * Analizuje klucze w storage i zwraca szczegółowe informacje.
     */
    static analyzeStorageKeys() {
        const analysis = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                const value = sessionStorage.getItem(key);
                if (value !== null) {
                    const size = key.length + value.length;
                    analysis.push({
                        key,
                        size,
                        sizeKB: (size * 2) / 1024, // UTF-16: 2 bajty na znak
                    });
                }
            }
        }
        return analysis.sort((a, b) => b.size - a.size);
    }
    /**
     * Wysyła ostrzeżenie o wysokim wykorzystaniu storage.
     */
    static makeStorageWarning(repositoryName, currentSize, estimatedTotalSize) {
        const storageLimit = this.STORAGE_LIMIT;
        const usagePercentage = ((estimatedTotalSize / storageLimit) * 100).toFixed(1);
        const currentUsagePercentage = ((currentSize / storageLimit) * 100).toFixed(1);
        const limitInfo = this.getStorageLimit();
        console.warn(`⚠️ ${repositoryName}: SessionStorage przekracza 80% pojemności!`);
        console.warn(`Aktualne: ${currentUsagePercentage}%, Po zapisaniu: ${usagePercentage}%`);
        console.warn(`Limit storage: ${limitInfo.detectedMB} MB (${limitInfo.source})`);
    }
    /**
     * Obsługuje błędy zapisu do storage.
     */
    static handleStorageError(error, key, repositoryName, data) {
        const currentStorageSize = this.calculateStorageSize();
        const serializedDataSize = JSON.stringify(data).length;
        console.error(`❌ ${repositoryName}: Błąd zapisu do sessionStorage:`, error);
        console.error(`Rozmiar storage: ${((currentStorageSize * 2) / 1024).toFixed(2)} KB`);
        console.error(`Rozmiar danych: ${((serializedDataSize * 2) / 1024).toFixed(2)} KB`);
        // Jeśli to są dane tablicowe, pokaż informacje o największych elementach
        if (Array.isArray(data) && data.length > 0 && data[0].id !== undefined) {
            const itemSizes = data
                .map((item) => ({
                id: item.id,
                size: JSON.stringify(item).length,
            }))
                .sort((a, b) => b.size - a.size);
            console.error("📊 Największe elementy:", itemSizes.slice(0, 5));
        }
        ToolsFetch_1.default.sendClientErrorReport(error, {
            repositoryName,
            currentStorageSize,
            serializedDataSize,
            dataType: Array.isArray(data) ? "array" : typeof data,
            itemsCount: Array.isArray(data) ? data.length : "not_array",
            timestamp: new Date().toISOString(),
            storageKey: key,
        });
    }
}
exports.SessionStorageManager = SessionStorageManager;
SessionStorageManager.WARNING_THRESHOLD = 0.8; // 80% wykorzystania
SessionStorageManager._detectedLimit = null;
