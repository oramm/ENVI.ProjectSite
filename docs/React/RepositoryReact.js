"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
const Tools_1 = __importDefault(require("./Tools"));
class RepositoryReact {
    constructor(initParameter) {
        this.currentItems = [];
        this.isMultiSelect = false;
        console.log('tworzę repozytorium: %o', initParameter);
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
    async loadItemsfromServer(formData, specialActionRoute) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetupReact_1.default.serverUrl + actionRoute);
        if (formData)
            for (const [key, value] of formData)
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
    /** używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    async clientSideEditItemHandler(dataItem) {
        const newIndex = this.items.findIndex((item) => item.id == dataItem.id);
        this.items[newIndex] = dataItem;
        console.log('%s:: wykonano funkcję: %s, %o', this.name, this, dataItem);
    }
    /** używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    clientSideAddNewItemHandler(dataItem) {
        this.items.push(dataItem);
        console.log('dodaję obiekt docelowy, jego parent: ,%o', dataItem._parent);
        this.addToCurrentItems(dataItem.id);
        console.log('%s:: wykonano funkcję: %o', this.name, dataItem);
    }
    async addNewItemNodeJS(newItem) {
        const newItemTmpId = this.items.length + 1 + '_pending';
        newItem._tmpId = newItemTmpId;
        const noBlobNewItem = { ...newItem };
        delete noBlobNewItem._blobEnviObjects;
        //this.currentItem = noBlobNewItem;
        //wstaw roboczy obiekt do repozytorium, żeby obsłużyć widok
        this.items.push(noBlobNewItem);
        try {
            let newItemFromServer = await this.addNewItemResponseHandlerNodeJS(newItem);
            return this.addNewItemViewOnSuccessHandler(newItemTmpId, newItemFromServer);
        }
        catch (err) {
            if (err instanceof Error) {
                this.addNewItemViewOnErrorHandler(newItemTmpId, noBlobNewItem, err);
                throw (err);
            }
        }
        ;
    }
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    async addNewItemResponseHandlerNodeJS(item) {
        const result = await fetch(MainSetupReact_1.default.serverUrl + this.actionRoutes.addNewRoute, {
            method: 'POST',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(item)
        });
        const resultText = await result.json();
        if (resultText.authorizeUrl)
            window.open(resultText.authorizeUrl);
        else {
            const parsedResult = Tools_1.default.tryParseJSONObject(resultText);
            if (parsedResult)
                return parsedResult;
            else
                return resultText;
        }
    }
    addNewItemViewOnSuccessHandler(newItemTmpId, newItemFromServer) {
        //usuń z repozytorium tymczasowy obiekt
        const index = this.items.findIndex((item) => item._tmpId == newItemTmpId);
        console.log('usuwam obiekt tymczasowy, jego _parent: %o', this.items[index]._parent);
        this.items.splice(index, 1);
        //wstaw do repozytorium nowy obiekt z serwera
        this.clientSideAddNewItemHandler(newItemFromServer);
        //atrybut '_tmpId' jest potrzebny do obsłużenia viewObject
        newItemFromServer._tmpId = newItemTmpId;
        return newItemFromServer;
    }
    addNewItemViewOnErrorHandler(newItemTmpId, newItem, err) {
        //usuń z repozytorium tymczasowy obiekt
        var index = this.items.findIndex((item) => item._tmpid == newItemTmpId);
        this.items.splice(index, 1);
    }
    /**edytuje obiekt w bazie danych i aktualizuje go w Repozytorium
     * aktualizuje te currentItemy, które mają ten sam id co edytowany obiekt
     * @param item obiekt do edycji
    */
    async editItemNodeJS(item) {
        const resultRawResponse = await fetch(MainSetupReact_1.default.serverUrl + this.actionRoutes.editRoute + '/' + item.id, {
            method: 'PUT',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(item)
        });
        const resultObject = await resultRawResponse.json();
        if (resultObject.authorizeUrl)
            window.open(resultObject.authorizeUrl);
        this.replaceItemById(resultObject.id, resultObject);
        this.replaceCurrentItemById(resultObject.id, resultObject);
        console.log('obiekt po edycji z serwera: %o', resultObject);
        return resultObject;
    }
    /**usuwa obiekt z bazy danych i usuwa go z Repozytorium
     * usuwa te currentItemy, które mają ten sam id co usuwany obiekt
     * @param id id obiektu do usunięcia
     * @returns obiekt usunięty z bazy danych
     * @throws Error gdy nie znaleziono obiektu do usunięcia
     * @throws Error gdy nie udało się usunąć obiektu z bazy danych
     * @throws Error gdy nie udało się usunąć obiektu z Repozytorium
     * @throws Error gdy nie udało się usunąć obiektu z currentItemów
     */
    async deleteItemNodeJS(id) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem)
            throw new Error('Nie znaleziono obiektu do usunięcia');
        try {
            let result = await fetch(MainSetupReact_1.default.serverUrl + this.actionRoutes.deleteRoute + '/' + oldItem.id, {
                method: 'DELETE',
                headers: this.makeRequestHeaders(),
                credentials: 'include',
                body: JSON.stringify(oldItem)
            });
            if (result.authorizeUrl)
                window.open(result.authorizeUrl);
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
    makeRequestHeaders() {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return myHeaders;
    }
}
exports.default = RepositoryReact;
