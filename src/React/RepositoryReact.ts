import { ErrorServerResponse, RepositoryDataItem } from "../../Typings/bussinesTypes";
import MainSetup from "./MainSetupReact";
import ToolsDate from "./ToolsDate";

export default class RepositoryReact<DataItemType extends RepositoryDataItem = RepositoryDataItem> {
    actionRoutes: ActionRoutes;
    items: DataItemType[];
    currentItems: DataItemType[] = [];
    name: string;
    isMultiSelect: boolean = false;
    pendingRequests: Map<string, Promise<any>> = new Map();

    constructor(initParameter: { name: string; actionRoutes: ActionRoutes }) {
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
        const itemSelected = this.items.find((item) => item.id === id);
        if (!itemSelected) throw new Error("Nie znaleziono elementu o id: " + id);
        if (this.isMultiSelect) this.currentItems.push(itemSelected);
        else this.currentItems[0] = itemSelected;
    }

    deleteFromCurrentItemsById(id: number) {
        const index = this.currentItems.findIndex((item) => item.id === id);
        this.currentItems.splice(index, 1);
    }

    replaceCurrentItemById(id: number, editedItem: DataItemType) {
        const index = this.currentItems.findIndex((item) => item.id === id);
        this.currentItems.splice(index, 1, editedItem);
    }

    replaceItemById(id: number, editedItem: DataItemType) {
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
    async loadItemFromRouter(id: number) {
        if (!id) throw new Error("Nie podano id obiektu do załadowania");

        if (this.items.length === 0) this.loadFromSessionStorage();
        if (this.items.length === 0) {
            await this.loadItemsFromServerPOST([{ id }]);
        }
        if (this.items.length === 0) throw new Error("Nie znaleziono elementów w repozytorium: " + this.name);

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
        if (!JSONFromSessionStorage) return;
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
    async loadItemsFromServerPOST(orConditions: any[] = [], specialActionRoute?: string) {
        const actionRoute = specialActionRoute ? specialActionRoute : this.actionRoutes.getRoute;
        const url = new URL(MainSetup.serverUrl + actionRoute);
        const requestKey = JSON.stringify({ url: url.toString(), body: orConditions });

        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const fetchPromise = this.fetchWithRetry(url.toString(), {
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

        this.items = (await fetchPromise) as DataItemType[];
        this.currentItems = [];
        this.saveToSessionStorage();
        console.log(this.name + " NodeJS: %o", this.items);
        return this.items;
    }

    /** Funkcja pomocnicza do ponawiania żądań */
    async fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000) {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
                }
                return await response.json();
            } catch (error) {
                if (i < retries - 1) {
                    await sleep(delay);
                } else {
                    console.error(error);
                    if (error instanceof TypeError) {
                        throw new Error(
                            `Próbowałem ${retries} razy. Brak połączenia z serwerem, sprawdź połączenie internetowe`
                        );
                    } else if (error instanceof Error) {
                        throw new Error(`Mimo ${retries} prób serwer zwrócił błąd: ${error.message}`);
                    } else {
                        throw new Error("Nieznany błąd po stronie klienta");
                    }
                }
            }
        }
    }

    /** Funkcja pomocnicza do dodawania nowych elementów */
    async addItem(newItem: any | FormData, deleteId: boolean, specialActionRoute?: string) {
        const actionRoute = specialActionRoute || this.actionRoutes.addNewRoute;
        const urlPath = `${MainSetup.serverUrl}${actionRoute}`;

        const requestKey = JSON.stringify({ url: urlPath, body: newItem });

        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const requestOptions: RequestInit = {
            method: "POST",
            credentials: "include",
        };

        if (newItem instanceof FormData) {
            requestOptions.body = newItem;
        } else {
            if (deleteId) {
                delete newItem.id;
            }
            requestOptions.headers = {
                ...requestOptions.headers,
                ["Content-Type"]: "application/json",
            };
            ToolsDate.convertDatesToUTC(newItem);
            requestOptions.body = JSON.stringify(newItem);
        }

        const fetchPromise = this.fetchWithRetry(urlPath, requestOptions).finally(() => {
            this.pendingRequests.delete(requestKey);
        });

        this.pendingRequests.set(requestKey, fetchPromise);
        const newItemFromServer: DataItemType = await fetchPromise;

        if ("errorMessage" in newItemFromServer) {
            console.error("Error from server: %o", newItemFromServer.errorMessage);
            throw new Error(`Błąd serwera: ${newItemFromServer.errorMessage}`);
        }

        if ("authorizeUrl" in newItemFromServer) window.open(newItemFromServer.authorizeUrl as string);

        const noBlobNewItem = { ...newItemFromServer };
        this.items.push(noBlobNewItem);
        this.currentItems = [newItemFromServer];
        this.saveToSessionStorage();
        console.log("%s:: utworzono i zapisano: %o", this.name, newItemFromServer);
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
     * @param _fieldsToUpdate - tablica z nazwami pól, które mają być zaktualizowane. Nazwa z podkreśleniem ze względu na serwer
     */
    async editItem(item: DataItemType | FormData, specialActionRoute?: string, _fieldsToUpdate?: string[]) {
        const actionRoute = specialActionRoute || this.actionRoutes.editRoute;
        const itemId = item instanceof FormData ? item.get("id") : item.id;
        const urlPath = `${MainSetup.serverUrl}${actionRoute}/${itemId}`;
        const requestKey = JSON.stringify({ url: urlPath, body: item });
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }

        const requestOptions: RequestInit = {
            method: "PUT",
            credentials: "include",
        };

        if (item instanceof FormData) {
            if (_fieldsToUpdate) item.append("_fieldsToUpdate", JSON.stringify(_fieldsToUpdate));
            requestOptions.body = item;
        } else {
            requestOptions.headers = {
                ...requestOptions.headers,
                ["Content-Type"]: "application/json",
            };
            ToolsDate.convertDatesToUTC(item);
            requestOptions.body = JSON.stringify({ ...item, _fieldsToUpdate });
        }

        try {
            const fetchPromise = this.fetchWithRetry(urlPath, requestOptions).finally(() => {
                this.pendingRequests.delete(requestKey);
            });
            this.pendingRequests.set(requestKey, fetchPromise);
            const resultObject = await fetchPromise;
            if ("authorizeUrl" in resultObject) {
                window.open(resultObject.authorizeUrl as string);
                console.log("Konieczna autoryzacja w Google - nie wyedytowano obiektu %o", item);
                return item as DataItemType;
            }

            this.replaceCurrentItemById(resultObject.id, resultObject);
            this.items = this.items.map((item) => (item.id === resultObject.id ? resultObject : item));
            this.saveToSessionStorage();
            console.log("Obiekt po edycji z serwera: %o", resultObject);
            return resultObject;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**usuwa obiekt z bazy danych i usuwa go z Repozytorium
     * usuwa te currentItemy, które mają ten sam id co usuwany obiekt
     * @param id id obiektu do usunięcia
     */
    async deleteItemNodeJS(id: number) {
        const oldItem = this.items.find((item) => item.id == id);
        if (!oldItem) throw new Error("Nie znaleziono obiektu do usunięcia");

        let response;
        try {
            response = await fetch(MainSetup.serverUrl + this.actionRoutes.deleteRoute + "/" + oldItem.id, {
                method: "DELETE",
                headers: this.makeRequestHeaders(),
                credentials: "include",
                body: JSON.stringify(oldItem),
            });
        } catch (networkError) {
            console.error("Network error: ", networkError);
            throw new Error("Błąd sieci, nie udało się połączyć z serwerem.");
        }

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
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
        } catch (localUpdateError) {
            console.error("Failed to update local state: ", localUpdateError);
            throw new Error("Błąd podczas aktualizacji lokalnego stanu.");
        }

        return oldItem;
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
};
