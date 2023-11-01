import { useParams } from "react-router-dom";
import { RepositoryDataItem } from "../../Typings/bussinesTypes";
import MainSetup from "./MainSetupReact";
import ToolsDate from "./ToolsDate";

export default class RepositoryReact<DataItemType extends RepositoryDataItem = RepositoryDataItem> {
    actionRoutes: ActionRoutes;
    items: DataItemType[];
    currentItems: DataItemType[] = [];
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

    replaceCurrentItemById(id: number, editedItem: DataItemType) {
        const index = this.currentItems.findIndex(item => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }

    replaceItemById(id: number, editedItem: DataItemType) {
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
    async loadItemFromRouter(id: number) {
        if (!id) throw new Error('Nie podano id obiektu do załadowania');

        if (this.items.length === 0)
            this.loadFromSessionStorage();
        if (this.items.length === 0) {
            await this.loadItemsFromServerPOST([{ id }]);
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
     * @param formData - klucze i wartości do wysłania w ciele żądania jako JSON (np. dla filtrowania)
     * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż getRoute
     */
    async loadItemsFromServerPOST(orConditions: any[] = [], specialActionRoute?: string) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetup.serverUrl + actionRoute);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...this.makeRequestHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orConditions }),
            credentials: 'include',
        });
        if (!response.ok) throw new Error(response.statusText);
        const loadedItems = await response.json();
        this.items = loadedItems;
        this.currentItems = [];

        console.log(this.name + ' NodeJS: %o', this.items);
        return this.items;
    }



    /** Funkcja pomocnicza do dodawania nowych elementów */
    async addItem(newItem: any | FormData, deleteId: boolean, specialActionRoute?: string) {
        const requestOptions: RequestInit = {
            method: 'POST',
            credentials: 'include',
        };

        if (newItem instanceof FormData) {
            requestOptions.body = newItem;
        } else {
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
        const urlPath = `${MainSetup.serverUrl}${actionRoute}`;
        const resultRawResponse = await fetch(
            urlPath,
            requestOptions
        );

        const newItemFromServer: DataItemType = await resultRawResponse.json();

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
        return newItemFromServer as DataItemType;
    }

    /** Dodaje obiekt do bazy danych i do repozytorium */
    async addNewItem(newItem: any | FormData, specialActionRoute?: string) {
        return this.addItem(newItem, true, specialActionRoute);
    }

    /** Kopiuje obiekt do bazy danych i do repozytorium */
    async copyItem(newItem: any | FormData, specialActionRoute: string | undefined = this.actionRoutes.copyRoute) {
        return this.addItem(newItem, false, specialActionRoute);
    }


    /** Edytuje obiekt w bazie danych i aktualizuje go w Repozytorium 
      * aktualizuje te currentItemy, które mają ten sam id co edytowany obiekt
      * @param item obiekt do edycji
      * @param specialActionRoute - jeżeli chcemy użyć innej ścieżki niż editRoute 
      *     podajemy tylko nazwę routa bez '/' i parametrów (domyślnie undefined)
      */
    async editItem(item: DataItemType | FormData, specialActionRoute?: string, fieldsToUpdate?: string[]) {
        const requestOptions: RequestInit = {
            method: 'PUT',
            credentials: 'include',
        };

        if (item instanceof FormData) {
            if (fieldsToUpdate) item.append('fieldsToUpdate', JSON.stringify(fieldsToUpdate))
            requestOptions.body = item;
        } else {
            requestOptions.headers = {
                ...requestOptions.headers,
                ['Content-Type']: 'application/json',
            };
            ToolsDate.convertDatesToUTC(item);
            requestOptions.body = JSON.stringify({ ...item, ...fieldsToUpdate });
        }
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.editRoute;
        const urlPath = `${MainSetup.serverUrl}${actionRoute}/${item instanceof FormData ? item.get('id') : item.id}`;

        const resultRawResponse = await fetch(
            urlPath,
            requestOptions
        );

        const resultObject = await resultRawResponse.json() as DataItemType;

        if (resultRawResponse.status >= 400) {
            console.error('Error from server: %o', resultObject.errorMessage);
            throw new Error(`Błąd serwera: ${resultObject.errorMessage}`);
        }

        if (resultObject.authorizeUrl) {
            window.open(resultObject.authorizeUrl);
            console.log('konieczna autoryzacja w Google - nie wyedytowano obiektu %o', item);
            return item as DataItemType;
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
    async deleteItemNodeJS(id: number) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem) throw new Error('Nie znaleziono obiektu do usunięcia');
        try {
            const response = await fetch(MainSetup.serverUrl + this.actionRoutes.deleteRoute + '/' + oldItem.id, {
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
        } catch (err) {
            this.items.push(oldItem);
            this.deleteFromCurrentItemsById(oldItem.id);
        }
    }

    clearData() {
        this.items = [];
        this.currentItems = [];
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