import MainSetup from "./MainSetupReact";
import Tools from "./Tools";


export default class RepositoryReact {
    actionRoutes: ActionRoutes;
    items: RepositoryDataItem[];
    currentItems: RepositoryDataItem[] = [];
    name: string;
    isMultiSelect: boolean = false;

    constructor(initParameter: { name: string, actionRoutes: ActionRoutes }) {
        //console.log('tworzę repozytorium: %o', initParameter);
        this.name = initParameter.name;
        this.actionRoutes = initParameter.actionRoutes;
        this.items = [];
    }

    /**dodaje element domyślny wg jego Id 
     * - jeżeli jest to lista wielokrotnego wyboru, to dodaje do listy
     * - jeżeli jest to lista jednokrotnego wyboru, to zastępuje element
    */
    addToCurrentItems(id: number) {
        const wasItemAlreadySelected = this.currentItems.find(existingDataItem => existingDataItem.id == id);
        if (wasItemAlreadySelected) return;

        const itemSelected = this.items.find(item => item.id === id);
        if (!itemSelected) throw new Error('Nie znaleziono elementu o id: ' + id);
        if (this.isMultiSelect)
            this.currentItems.push(itemSelected);
        else
            this.currentItems[0] = itemSelected;
    }

    deleteFromCurrentItemsById(id: number) {
        const index = this.currentItems.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1);
    }

    replaceCurrentItemById(id: number, editedItem: RepositoryDataItem) {
        const index = this.currentItems.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }

    replaceItemById(id: number, editedItem: RepositoryDataItem) {
        const index = this.items.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }

    saveToSessionStorage() {
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }

    /**Ładuje items z sessionstorage i resetuje currentitems */
    loadFromSessionStorage() {
        const JSONFromSessionStorage = sessionStorage.getItem(this.name);
        if (!JSONFromSessionStorage) return;
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
    async loadItemsfromServer(formData?: FormData, specialActionRoute?: string) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetup.serverUrl + actionRoute);
        if (formData)
            for (const [key, value] of formData)
                url.searchParams.append(key, value as string);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
        });
        if (!response.ok) throw new Error(response.statusText);
        const loadedItems = await response.json();
        this.items = loadedItems;
        this.currentItems = [];

        console.log(this.name + ' NodeJS: %o', this.items);
        return this.items;
    }

    /** używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    async clientSideEditItemHandler(dataItem: RepositoryDataItem) {
        const newIndex = this.items.findIndex((item) => item.id == dataItem.id);
        this.items[newIndex] = dataItem;
        console.log('%s:: wykonano funkcję: %s, %o', this.name, this, dataItem);
    }

    /** używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    clientSideAddNewItemHandler(dataItem: RepositoryDataItem) {
        this.items.push(dataItem);
        console.log('dodaję obiekt docelowy, jego parent: ,%o', dataItem._parent)
        this.addToCurrentItems(dataItem.id);
        console.log('%s:: wykonano funkcję: %o', this.name, dataItem);
    }

    /** Dodaje obiekt do bazy danych i do repozytorium */
    async addNewItemNodeJS(newItem: any | FormData) {
        const requestOptions: RequestInit = {
            method: 'POST',
            credentials: 'include',
        };

        if (newItem instanceof FormData) {
            requestOptions.body = newItem;
        } else {
            requestOptions.headers = {
                ...requestOptions.headers,
                ['Content-Type']: 'application/json',
            };
            requestOptions.body = JSON.stringify(newItem);
        }

        const rawResult = await fetch(
            MainSetup.serverUrl + this.actionRoutes.addNewRoute,
            requestOptions
        );
        const newItemFromServer: RepositoryDataItem = await rawResult.json();
        if (newItemFromServer.authorizeUrl)
            window.open(newItemFromServer.authorizeUrl);

        const noBlobNewItem = { ...newItemFromServer };
        delete noBlobNewItem._blobEnviObjects;

        this.items.push(noBlobNewItem);
        this.currentItems = [newItemFromServer];
        return newItemFromServer as RepositoryDataItem;
    }

    /**Edytuje obiekt w bazie danych i aktualizuje go w Repozytorium 
     * aktualizuje te currentItemy, które mają ten sam id co edytowany obiekt
     * @param item obiekt do edycji
    */
    async editItemNodeJS(item: RepositoryDataItem) {
        const resultRawResponse = await fetch(MainSetup.serverUrl + this.actionRoutes.editRoute + '/' + item.id, {
            method: 'PUT',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(item)
        });
        const resultObject: RepositoryDataItem = await resultRawResponse.json();
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
     * @returns obiekt usunięty z bazy danych
     * @throws Error gdy nie znaleziono obiektu do usunięcia
     * @throws Error gdy nie udało się usunąć obiektu z bazy danych
     * @throws Error gdy nie udało się usunąć obiektu z Repozytorium
     * @throws Error gdy nie udało się usunąć obiektu z currentItemów
     */
    async deleteItemNodeJS(id: number) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem) throw new Error('Nie znaleziono obiektu do usunięcia');
        try {
            let result: any = await fetch(MainSetup.serverUrl + this.actionRoutes.deleteRoute + '/' + oldItem.id, {
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
        } catch (err) {
            this.items.push(oldItem);
            this.deleteFromCurrentItemsById(oldItem.id);
        }
    }

    private makeRequestHeaders() {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return myHeaders;
    }
}

export type ActionRoutes = {
    getRoute: string;
    addNewRoute: string;
    editRoute: string;
    deleteRoute: string;
    copyRoute?: string;
}

export type RepositoryDataItem = {
    id: number;
    [key: string]: any;
};