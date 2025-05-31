"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
const ToolsDate_1 = __importDefault(require("./Tools/ToolsDate"));
const ToolsFetch_1 = __importDefault(require("./Tools/ToolsFetch"));
class RepositoryReact {
    constructor(initParameter) {
        this.currentItems = [];
        this.isMultiSelect = false;
        this.pendingRequests = new Map();
        //console.log('tworzę repozytorium: %o', initParameter);
        this.name = initParameter.name;
        this.actionRoutes = initParameter.actionRoutes;
        this.items = [];
    }
    /**dodaje element domyślny wg jego Id
     * - jeżeli jest to lista wielokrotnego wyboru, to dodaje do listy
     * - jeżeli jest to lista jednokrotnego wyboru, to zastępuje element
     */
    addToCurrentItems(id) {
        const itemSelected = this.items.find((item) => item.id === id);
        if (!itemSelected)
            throw new Error("Nie znaleziono elementu o id: " + id);
        if (this.isMultiSelect)
            this.currentItems.push(itemSelected);
        else
            this.currentItems[0] = itemSelected;
    }
    deleteFromCurrentItemsById(id) {
        const index = this.currentItems.findIndex((item) => item.id === id);
        this.currentItems.splice(index, 1);
    }
    replaceCurrentItemById(id, editedItem) {
        const index = this.currentItems.findIndex((item) => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }
    replaceItemById(id, editedItem) {
        const index = this.items.findIndex((item) => item.id === id);
        this.items.splice(index, 1, editedItem);
    }
    saveToSessionStorage() {
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    /**pobiera obiekt z repozytorim na podstawie Id w adresie url
     * - jeżeli nie ma obiektów w repozytorium, to ładuje je z sessionstorage
     * - jeżeli nie ma obiektów w sessionstorage, to ładuje je z serwera
     */
    async loadItemFromRouter(id) {
        if (!id)
            throw new Error("Nie podano id obiektu do załadowania");
        if (this.items.length === 0)
            this.loadFromSessionStorage();
        if (this.items.length === 0) {
            await this.loadItemsFromServerPOST([{ id }]);
        }
        if (this.items.length === 0)
            throw new Error("Nie znaleziono elementów w repozytorium: " + this.name);
        // Znajdź i zwróć żądany element
        const item = this.items.find((item) => item.id === id);
        if (!item) {
            throw new Error("Nie znaleziono obiektu z podanym id: " + id);
        }
        return item;
    }
    /**Ładuje items z sessionstorage i resetuje currentitems */
    loadFromSessionStorage() {
        const JSONFromSessionStorage = sessionStorage.getItem(this.name);
        if (!JSONFromSessionStorage)
            return;
        const data = JSON.parse(JSONFromSessionStorage);
        if (data.items) {
            this.items = data.items;
            this.currentItems = [];
        }
        console.log(this.name + " items from SessionStorage: %o", this.items);
    }
    /**
     * Ładuje items z serwera i resetuje currentitems
     * @param formData - klucze i wartości do wysłania w ciele żądania jako JSON (np. dla filtrowania)
     * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż getRoute
     */
    async loadItemsFromServerPOST(orConditions = [], specialActionRoute) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetupReact_1.default.serverUrl + actionRoute);
        const requestKey = JSON.stringify({ url: url.toString(), body: orConditions });
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }
        try {
            const fetchPromise = ToolsFetch_1.default.fetchWithRetry(url.toString(), {
                method: "POST",
                headers: {
                    ...this.makeRequestHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orConditions }),
                credentials: "include",
            }).finally(() => {
                this.pendingRequests.delete(requestKey);
            });
            this.pendingRequests.set(requestKey, fetchPromise);
            this.items = (await fetchPromise);
            this.currentItems = [];
            this.saveToSessionStorage();
            console.log(this.name + " NodeJS: %o", this.items);
            return this.items;
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "loadItemsFromServerPOST",
                orConditions,
                actionRoute,
            });
            throw error;
        }
    }
    async loadCurrentItemDetailsFromServerPOST(specialActionRoute) {
        const conditions = { id: this.currentItems[0].id };
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetupReact_1.default.serverUrl + actionRoute);
        const requestKey = JSON.stringify({ url: url.toString(), body: conditions });
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }
        try {
            const fetchPromise = ToolsFetch_1.default.fetchWithRetry(url.toString(), {
                method: "POST",
                headers: {
                    ...this.makeRequestHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(conditions),
                credentials: "include",
            }).finally(() => {
                this.pendingRequests.delete(requestKey);
            });
            this.pendingRequests.set(requestKey, fetchPromise);
            const detailedItem = (await fetchPromise);
            this.items = this.items.map((item) => (item.id === detailedItem.id ? detailedItem : item));
            this.currentItems[0] = detailedItem;
            this.saveToSessionStorage();
            console.log("CurrentItemDetailsLoaded: " + this.name + ": %o", this.items);
            return this.currentItems[0];
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "loadCurrentItemDetailsFromServerPOST",
                conditions,
                actionRoute,
                item: this.currentItems[0] || null,
            });
            throw error;
        }
    }
    /**
     * Dodaje nowy obiekt do bazy danych.
     * Obsługuje dwa tryby:
     *  - stary backend: zwraca gotowy obiekt (DataItemType)
     *  - nowy backend: zwraca taskId → frontend odpytuje backend aż zakończy przetwarzanie
     */
    async addNewItemAsync(newItem, deleteId, specialActionRoute, onProgress) {
        // 1. Budujemy ścieżkę do endpointu
        const actionRoute = specialActionRoute || this.actionRoutes.addNewRoute;
        const urlPath = `${MainSetupReact_1.default.serverUrl}${actionRoute}`;
        // 2. Przygotowanie opcji fetch
        const requestOptions = {
            method: "POST",
            credentials: "include", // uwzględnij ciasteczka/sesję
        };
        // 3. Konfiguracja żądania dla FormData vs JSON
        if (newItem instanceof FormData) {
            requestOptions.body = newItem;
        }
        else {
            if (deleteId)
                delete newItem.id;
            requestOptions.headers = {
                "Content-Type": "application/json",
            };
            ToolsDate_1.default.convertDatesToUTC(newItem); // standaryzuj daty
            requestOptions.body = JSON.stringify(newItem);
        }
        try {
            // 4. Wyślij żądanie – może zwrócić taskId (nowa wersja) lub gotowy obiekt (stara wersja)
            const response = await ToolsFetch_1.default.fetchWithRetry(urlPath, requestOptions);
            if (onProgress && response.taskId)
                onProgress(response);
            // 5. Jeśli brak taskId — to stara wersja backendu, zwrócono gotowy obiekt
            if (response && !response.taskId) {
                const item = response;
                this.items.push(item);
                this.currentItems = [item];
                this.saveToSessionStorage();
                console.log("%s:: synchronicznie utworzono: %o", this.name, item);
                return item;
            }
            // 6. Mamy taskId – zaczynamy polling do zakończenia zadania
            const taskId = response.taskId;
            // 7. Polling: co 2s aż task zakończy (max 60 prób = 2 min)
            const statusResponse = await this.pollTask(taskId, onProgress);
            // 8. Obsługa błędu z backendu
            if (statusResponse.status === "error") {
                throw new Error("Błąd backendu: " + statusResponse.error);
            }
            // 9. Gotowy przetworzony obiekt z backendu
            const newItemFromServer = statusResponse.result;
            // 10. Zapisanie do repozytorium i sessionStorage
            this.items.push(newItemFromServer);
            this.currentItems = [newItemFromServer];
            this.saveToSessionStorage();
            console.log("%s:: asynchronicznie utworzono: %o", this.name, newItemFromServer);
            return newItemFromServer;
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "addNewItemAsync",
                actionRoute,
                itemType: newItem instanceof FormData ? "FormData" : "JSON",
                item: newItem,
            });
            throw error;
        }
    }
    /** Dodaje obiekt do bazy danych i do repozytorium */
    async addNewItem(newItem, specialActionRoute, onProgress) {
        return this.addNewItemAsync(newItem, true, specialActionRoute, onProgress);
    }
    /** Kopiuje obiekt do bazy danych i do repozytorium */
    async copyItem(newItem, specialActionRoute = this.actionRoutes.copyRoute) {
        return this.addNewItemAsync(newItem, false, specialActionRoute);
    }
    /** Edytuje obiekt w bazie danych i aktualizuje go w Repozytorium
     * aktualizuje te currentItemy, które mają ten sam id co edytowany obiekt
     * @param item obiekt do edycji
     * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż editRoute
     *     podajemy tylko nazwę routa bez '/' i parametrów (domyślnie undefined)
     * @param _fieldsToUpdate - tablica z nazwami pól, które mają być zaktualizowane. Nazwa z podkreśleniem ze względu na serwer
     */
    async editItem(item, specialActionRoute, _fieldsToUpdate, onProgress) {
        const actionRoute = specialActionRoute || this.actionRoutes.editRoute;
        const itemId = item instanceof FormData ? item.get("id") : item.id;
        const urlPath = `${MainSetupReact_1.default.serverUrl}${actionRoute}/${itemId}`;
        const requestKey = JSON.stringify({ url: urlPath, body: item });
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }
        const requestOptions = {
            method: "PUT",
            credentials: "include",
        };
        if (item instanceof FormData) {
            if (_fieldsToUpdate)
                item.append("_fieldsToUpdate", JSON.stringify(_fieldsToUpdate));
            requestOptions.body = item;
        }
        else {
            requestOptions.headers = {
                ...requestOptions.headers,
                ["Content-Type"]: "application/json",
            };
            ToolsDate_1.default.convertDatesToUTC(item);
            requestOptions.body = JSON.stringify({ ...item, _fieldsToUpdate });
        }
        try {
            const fetchPromise = ToolsFetch_1.default.fetchWithRetry(urlPath, requestOptions).finally(() => {
                this.pendingRequests.delete(requestKey);
            });
            this.pendingRequests.set(requestKey, fetchPromise);
            const response = await fetchPromise;
            // 🆕 Jeśli backend zwraca taskId — włącz polling
            if (response && response.taskId) {
                if (onProgress)
                    onProgress(response);
                const taskId = response.taskId;
                const statusResponse = await this.pollTask(taskId, onProgress);
                if (statusResponse.status === "error") {
                    throw new Error("Błąd backendu: " + statusResponse.error);
                }
                const editedItemFromServer = statusResponse.result;
                this.replaceCurrentItemById(editedItemFromServer.id, editedItemFromServer);
                this.items = this.items.map((x) => (x.id === editedItemFromServer.id ? editedItemFromServer : x));
                this.saveToSessionStorage();
                return editedItemFromServer;
            }
            // 🔁 Stara wersja (od razu gotowy obiekt)
            if ("authorizeUrl" in response) {
                window.open(response.authorizeUrl);
                console.log("Konieczna autoryzacja w Google - nie wyedytowano obiektu %o", item);
                return item;
            }
            this.replaceCurrentItemById(response.id, response);
            this.items = this.items.map((x) => (x.id === response.id ? response : x));
            this.saveToSessionStorage();
            console.log("Obiekt po edycji z serwera: %o", response);
            return response;
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "editItem",
                actionRoute,
                itemId,
                itemType: item instanceof FormData ? "FormData" : "JSON",
                item,
                _fieldsToUpdate,
            });
            console.error(error);
            throw error;
        }
    }
    /**usuwa obiekt z bazy danych i usuwa go z Repozytorium
     * usuwa te currentItemy, które mają ten sam id co usuwany obiekt
     * @param id id obiektu do usunięcia
     */
    async deleteItemNodeJS(id) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem)
            throw new Error("Nie znaleziono obiektu do usunięcia");
        let response;
        try {
            response = await fetch(MainSetupReact_1.default.serverUrl + this.actionRoutes.deleteRoute + "/" + oldItem.id, {
                method: "DELETE",
                headers: this.makeRequestHeaders(),
                credentials: "include",
                body: JSON.stringify(oldItem),
            });
        }
        catch (networkError) {
            ToolsFetch_1.default.sendClientErrorReport(networkError, {
                repositoryName: this.name,
                action: "deleteItemNodeJS",
                errorType: "network",
                item: oldItem,
            });
            console.error("Network error: ", networkError);
            throw new Error("Błąd sieci, nie udało się połączyć z serwerem.");
        }
        let result;
        try {
            result = await response.json();
        }
        catch (parseError) {
            ToolsFetch_1.default.sendClientErrorReport(parseError, {
                repositoryName: this.name,
                action: "deleteItemNodeJS",
                errorType: "parse",
                item: oldItem,
            });
            console.error("Failed to parse response: ", parseError);
            throw new Error("Nie udało się przetworzyć odpowiedzi z serwera.");
        }
        if (result.errorMessage) {
            console.error("Error from server: %s", result.errorMessage);
            throw new Error(`Błąd serwera: ${result.errorMessage}`);
        }
        if (result.authorizeUrl) {
            window.open(result.authorizeUrl);
        }
        try {
            this.deleteFromCurrentItemsById(oldItem.id);
            this.items = this.items.filter((item) => item.id != oldItem.id);
            this.saveToSessionStorage();
            console.log("%s:: usunięto obiekt: %o", this.name, oldItem);
        }
        catch (localUpdateError) {
            ToolsFetch_1.default.sendClientErrorReport(localUpdateError, {
                repositoryName: this.name,
                action: "deleteItemNodeJS",
                item: oldItem,
                errorType: "localUpdate",
            });
            console.error("Failed to update local state: ", localUpdateError);
            throw new Error("Błąd podczas aktualizacji lokalnego stanu.");
        }
        return oldItem;
    }
    /**
     * Wykonuje zapytanie do serwera
     * @param actionRoute - ścieżka do akcji na serwerze
     * @param item
     */
    async fetch(actionRoute, item) {
        const urlPath = `${MainSetupReact_1.default.serverUrl}${actionRoute}`;
        const requestKey = JSON.stringify({ url: urlPath, body: item });
        const requestOptions = {
            method: "PUT",
            credentials: "include",
            headers: {
                ["Content-Type"]: "application/json",
            },
        };
        ToolsDate_1.default.convertDatesToUTC(item);
        requestOptions.body = JSON.stringify({ ...item });
        try {
            const fetchPromise = ToolsFetch_1.default.fetchWithRetry(urlPath, requestOptions).finally(() => {
                this.pendingRequests.delete(requestKey);
            });
            this.pendingRequests.set(requestKey, fetchPromise);
            const resultObject = await fetchPromise;
            return resultObject;
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "fetch",
                actionRoute,
                item,
            });
            throw error;
        }
    }
    clearData() {
        this.items = [];
        this.currentItems = [];
    }
    async pollTask(taskId, onProgress) {
        const statusUrl = `${MainSetupReact_1.default.serverUrl}sessionTaskStatus/${taskId}`;
        try {
            for (let i = 0; i < 60; i++) {
                await new Promise((res) => setTimeout(res, 2000));
                const statusResponse = await ToolsFetch_1.default.fetchWithRetry(statusUrl, {
                    method: "GET",
                    credentials: "include",
                });
                if (onProgress)
                    onProgress(statusResponse);
                if (statusResponse.status !== "processing")
                    return statusResponse;
            }
            throw new Error("Przekroczono limit czasu oczekiwania na zakończenie zadania.");
        }
        catch (error) {
            ToolsFetch_1.default.sendClientErrorReport(error, {
                repositoryName: this.name,
                action: "pollTask",
                taskId,
            });
            throw error;
        }
    }
    makeRequestHeaders() {
        return { "Content-Type": "application/json" };
    }
}
exports.default = RepositoryReact;
