"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
const ToolsDate_1 = __importDefault(require("./ToolsDate"));
class RepositoryReact {
    constructor(initParameter) {
        this.currentItems = [];
        this.isMultiSelect = false;
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
        const wasItemAlreadySelected = this.currentItems.find(existingDataItem => existingDataItem.id == id);
        if (wasItemAlreadySelected)
            return;
        const itemSelected = this.items.find(item => item.id === id);
        if (!itemSelected)
            throw new Error('Nie znaleziono elementu o id: ' + id);
        if (this.isMultiSelect)
            this.currentItems.push(itemSelected);
        else
            this.currentItems[0] = itemSelected;
    }
    deleteFromCurrentItemsById(id) {
        const index = this.currentItems.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1);
    }
    replaceCurrentItemById(id, editedItem) {
        const index = this.currentItems.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }
    replaceItemById(id, editedItem) {
        const index = this.items.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
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
            throw new Error('Nie podano id obiektu do załadowania');
        if (this.items.length === 0)
            this.loadFromSessionStorage();
        if (this.items.length === 0) {
            const params = { id: id.toString() };
            await this.loadItemsFromServer(params);
        }
        if (this.items.length === 0)
            throw new Error('Nie znaleziono elementów w repozytorium: ' + this.name);
        // Znajdź i zwróć żądany element
        const item = this.items.find(item => item.id === id);
        if (!item) {
            throw new Error('Nie znaleziono obiektu z podanym id: ' + id);
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
        console.log(this.name + ' items from SessionStorage: %o', this.items);
    }
    /**
     * Ładuje items z serwera i resetuje currentitems
     * @param formData - klucze i wartości do wysłania w urlu jako parametry get (np. dla filtrowania)
     * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż getRoute
     */
    async loadItemsFromServer(params, specialActionRoute) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetupReact_1.default.serverUrl + actionRoute);
        if (params)
            for (const [key, value] of Object.entries(params))
                url.searchParams.append(key, value);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
        });
        if (!response.ok)
            throw new Error(response.statusText);
        const loadedItems = await response.json();
        this.items = loadedItems;
        this.currentItems = [];
        console.log(this.name + ' NodeJS: %o', this.items);
        return this.items;
    }
    /** Funkcja pomocnicza do dodawania nowych elementów */
    async addItem(newItem, deleteId, specialActionRoute) {
        const requestOptions = {
            method: 'POST',
            credentials: 'include',
        };
        if (newItem instanceof FormData) {
            requestOptions.body = newItem;
        }
        else {
            if (deleteId) {
                delete newItem.id;
            }
            requestOptions.headers = {
                ...requestOptions.headers,
                ['Content-Type']: 'application/json',
            };
            requestOptions.body = JSON.stringify(newItem);
        }
        let actionRoute = specialActionRoute || this.actionRoutes.addNewRoute;
        const urlPath = `${MainSetupReact_1.default.serverUrl}${actionRoute}`;
        const resultRawResponse = await fetch(urlPath, requestOptions);
        const newItemFromServer = await resultRawResponse.json();
        if (newItemFromServer.errorMessage) {
            console.error('Error from server: %o', newItemFromServer.errorMessage);
            throw new Error(`Błąd serwera: ${newItemFromServer.errorMessage}`);
        }
        if (newItemFromServer.authorizeUrl)
            window.open(newItemFromServer.authorizeUrl);
        const noBlobNewItem = { ...newItemFromServer };
        delete noBlobNewItem._blobEnviObjects;
        this.items.push(noBlobNewItem);
        this.currentItems = [newItemFromServer];
        console.log('%s:: utworzono i zapisano: %o', this.name, newItemFromServer);
        return newItemFromServer;
    }
    /** Dodaje obiekt do bazy danych i do repozytorium */
    async addNewItem(newItem, specialActionRoute) {
        return this.addItem(newItem, true, specialActionRoute);
    }
    /** Kopiuje obiekt do bazy danych i do repozytorium */
    async copyItem(newItem, specialActionRoute = this.actionRoutes.copyRoute) {
        return this.addItem(newItem, false, specialActionRoute);
    }
    /** Edytuje obiekt w bazie danych i aktualizuje go w Repozytorium
      * aktualizuje te currentItemy, które mają ten sam id co edytowany obiekt
      * @param item obiekt do edycji
      * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż editRoute
      *     podajemy tylko nazwę routa bez '/' i parametrów (domyślnie undefined)
      */
    async editItem(item, specialActionRoute) {
        const requestOptions = {
            method: 'PUT',
            credentials: 'include',
        };
        if (item instanceof FormData) {
            requestOptions.body = item;
        }
        else {
            requestOptions.headers = {
                ...requestOptions.headers,
                ['Content-Type']: 'application/json',
            };
            ToolsDate_1.default.convertDatesToUTC(item);
            requestOptions.body = JSON.stringify(item);
        }
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.editRoute;
        const urlPath = `${MainSetupReact_1.default.serverUrl}${actionRoute}/${item instanceof FormData ? item.get('id') : item.id}`;
        const resultRawResponse = await fetch(urlPath, requestOptions);
        const resultObject = await resultRawResponse.json();
        if (resultRawResponse.status >= 400) {
            console.error('Error from server: %o', resultObject.errorMessage);
            throw new Error(`Błąd serwera: ${resultObject.errorMessage}`);
        }
        if (resultObject.authorizeUrl) {
            window.open(resultObject.authorizeUrl);
            console.log('konieczna autoryzacja w Google - nie wyedytowano obiektu %o', item);
            return item;
        }
        this.replaceItemById(resultObject.id, resultObject);
        this.replaceCurrentItemById(resultObject.id, resultObject);
        console.log('obiekt po edycji z serwera: %o', resultObject);
        return resultObject;
    }
    /**usuwa obiekt z bazy danych i usuwa go z Repozytorium
     * usuwa te currentItemy, które mają ten sam id co usuwany obiekt
     * @param id id obiektu do usunięcia
     */
    async deleteItemNodeJS(id) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem)
            throw new Error('Nie znaleziono obiektu do usunięcia');
        try {
            const response = await fetch(MainSetupReact_1.default.serverUrl + this.actionRoutes.deleteRoute + '/' + oldItem.id, {
                method: 'DELETE',
                headers: this.makeRequestHeaders(),
                credentials: 'include',
                body: JSON.stringify(oldItem)
            });
            const result = await response.json();
            if (result.errorMessage) {
                console.error('Error from server: %s', result.errorMessage);
                throw new Error(`Błąd serwera: ${result.errorMessage}`);
            }
            if (result.authorizeUrl) {
                window.open(result.authorizeUrl);
            }
            this.deleteFromCurrentItemsById(oldItem.id);
            this.items = this.items.filter((item) => item.id != oldItem.id);
            console.log('%s:: usunięto obiekt: %o', this.name, oldItem);
            return oldItem;
        }
        catch (err) {
            this.items.push(oldItem);
            this.deleteFromCurrentItemsById(oldItem.id);
        }
    }
    clearData() {
        this.items = [];
        this.currentItems = [];
    }
    makeRequestHeaders() {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return myHeaders;
    }
}
exports.default = RepositoryReact;
