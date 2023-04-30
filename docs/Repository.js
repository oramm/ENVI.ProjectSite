"use strict";
class Repository {
    /*
     * Może być inicjowane z danych z serwera, wtedy argumentem jest name jako string
     * Może być też inicjowane z obiektu SessionStorage, wtedy paremetrem jest ten obiekt
     * @param {type} name
     * @returns {Repository}
     */
    constructor(initParameter, name) {
        if (!name && !initParameter?.name)
            throw new SyntaxError("Repository must have a name!");
        this.name = name || initParameter?.name || '';
        this.itemsLocalData;
        //Repository może mieć wiele bieżących elementów (multiselect)
        this.currentItemsLocalData = [];
        //mamy obiekt z SessionStorage lub z nodeJS
        if (initParameter) {
            this.currentItemLocalData = (initParameter.currentItemLocalData) ? initParameter.currentItemLocalData : {};
            this.actionsGASSetup = initParameter.actionsGASSetup;
            this.actionsNodeJSSetup = initParameter.actionsNodeJSSetup;
            if (initParameter.itemsLocalData) {
                this.itemsLocalData = initParameter.itemsLocalData;
                console.log(this.name + ' items from SessionStorage: %o', this.itemsLocalData);
            }
            else {
            }
            this.actionsGASSetup = {
                addNew: (initParameter.actionsGASSetup && initParameter.actionsGASSetup.addNew) ? true : false,
                edit: (initParameter.actionsGASSetup && initParameter.actionsGASSetup.edit) ? true : false,
                delete: (initParameter.actionsGASSetup && initParameter.actionsGASSetup.delete) ? true : false,
            };
            this.actionsNodeJSSetup = {
                addNewRoute: (initParameter.actionsNodeJSSetup) ? initParameter.actionsNodeJSSetup.addNewRoute : undefined,
                editRoute: (initParameter.actionsNodeJSSetup) ? initParameter.actionsNodeJSSetup.editRoute : undefined,
                deleteRoute: (initParameter.actionsNodeJSSetup) ? initParameter.actionsNodeJSSetup.deleteRoute : undefined,
                copyRoute: (initParameter.actionsNodeJSSetup) ? initParameter.actionsNodeJSSetup.copyRoute : undefined,
            };
        }
    }
    get items() {
        if (this.name)
            return (this.itemsLocalData) ? this.itemsLocalData : JSON.parse(sessionStorage.getItem(this.name)).itemsLocalData;
        return [];
    }
    set items(data) {
        data.length && delete data[data.length - 1]._blobEnviObjects;
        this.itemsLocalData = data;
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    get currentItem() {
        return (this.currentItemLocalData) ? this.currentItemLocalData : JSON.parse(sessionStorage.getItem(this.name)).currentItem;
    }
    //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
    get currentItems() {
        return (this.currentItemsLocalData) ? this.currentItemsLocalData : JSON.parse(sessionStorage.getItem(this.name)).currentItems;
    }
    set currentItems(data) {
        this.currentItemsLocalData = data;
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    set currentItem(item) {
        if (typeof item !== 'object' && item !== undefined)
            throw new Error("Selected repository item must be an object!");
        //nie przesyłamy do repozytorium blobów z FileInput
        if (item !== undefined) {
            delete item._blobEnviObjects;
            this.currentItemId = item.id;
        }
        else
            this.currentItemId = undefined;
        this.currentItemLocalData = item;
        if (!Tools.isObjectEmpty(item))
            this.addToCurrentItems(item);
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
    addToCurrentItems(newDataItem) {
        if (newDataItem) {
            if (this.currentItemsLocalData && this.currentItemsLocalData[0])
                var wasItemAlreadySelected = this.currentItemsLocalData.filter(existingDataItem => existingDataItem.id == newDataItem.id)[0];
            if (!wasItemAlreadySelected)
                this.currentItemsLocalData.push(newDataItem);
        }
        //sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
    deleteFromCurrentItems(item) {
        if (!item || typeof item !== 'object')
            throw new SyntaxError("Selected item must be an object!");
        var index = Tools.arrGetIndexOf(this.currentItemsLocalData, 'id', item.id);
        if (index !== undefined)
            this.currentItemsLocalData.splice(index, 1);
        sessionStorage.setItem(this.name, JSON.stringify(this));
    }
    setCurrentItemById(id) {
        if (id === undefined)
            throw new SyntaxError("Selected item id must be specified!");
        this.currentItemId = id;
        this.currentItem = Tools.search(id, "id", this.items);
    }
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    clientSideEditItemHandler(dataItem) {
        return new Promise((resolve, reject) => {
            var newIndex = this.items.findIndex((item) => item.id == dataItem.id);
            this.items[newIndex] = dataItem;
            console.log('%s:: wykonano funkcję: %s, %o', this.name, this, dataItem);
            resolve(dataItem);
        });
    }
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    clientSideAddNewItemHandler(dataItem, serverFunctionName = '') {
        return new Promise((resolve, reject) => {
            this.items.push(dataItem);
            console.log('dodaję obiekt docelowy, jego parent: ,%o', dataItem._parent);
            this.currentItem = dataItem;
            console.log('%s:: wykonano funkcję: %s, %o', this.name, serverFunctionName, dataItem);
            resolve(dataItem);
        });
    }
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    async clientSideDeleteItemHandler(dataItem) {
        var index = this.items.findIndex((item) => item.id == dataItem.id);
        this.items.splice(index, 1);
        this.currentItem = {};
        console.log('%s:: wykonano funkcję: %s, %o', this.name, this.deleteServerFunctionName, dataItem);
        return dataItem;
    }
    doServerFunction(serverFunctionName, serverFunctionParameters) {
        return new Promise((resolve, reject) => {
            // Create an execution request object.
            // Create execution request.
            const request = {
                'function': serverFunctionName,
                'parameters': serverFunctionParameters,
                'devMode': true // Optional.
            };
            // Make the API request.
            const op = gapi.client.request({
                //@ts-ignore
                'root': 'https://script.googleapis.com',
                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                'method': 'POST',
                'body': request
            });
            op
                .then((resp) => this.handleDoServerFunction(resp.result))
                .then((result) => {
                console.log(this.name + ' ' + serverFunctionName + '() items from db: %o ', result);
                resolve(result);
            })
                .catch((err) => {
                console.error(serverFunctionName, err);
                window.alert('Wystąił Błąd! \n ' + err);
                throw err;
            });
        });
    }
    //TODO: scalić funkcje handleDoServerFunction() z handleAddNewItem
    handleDoServerFunction(resp) {
        return new Promise((resolve, reject) => {
            let result;
            if (resp.error && resp.error.status) {
                // The API encountered a problem before the script
                // started executing.
                result = 'Error calling API:';
                result += JSON.stringify(resp);
                console.error(resp.error);
                throw result;
                //throw resp.error;
            }
            else if (resp.error) {
                // The API executed, but the script returned an error.
                // Extract the first (and only) set of error details.
                // The values of this object are the script's 'errorMessage' and
                // 'errorType', and an array of stack trace elements.
                var error = resp.error.details[0];
                result = 'Script error message: ' + error.errorMessage;
                console.error(resp.error);
                if (error.scriptStackTraceElements) {
                    // There may not be a stacktrace if the script didn't start
                    // executing.
                    result = 'Script error stacktrace:';
                    for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                        var trace = error.scriptStackTraceElements[i];
                        result += ('\t' + trace.function + ':' + trace.lineNumber);
                    }
                    throw resp.error.details[0].errorMessage;
                }
            }
            else {
                // The structure of the result will depend upon what the Apps
                // Script function returns. 
                var serverResponse = resp.response.result;
                if (!serverResponse || Object.keys(serverResponse).length == 0) {
                    result = [];
                    resolve(result);
                }
                else {
                    //itemsList = serverResponse;
                    result = this.name + '  succes';
                    resolve(serverResponse);
                }
            }
        });
    }
    /*
     * wywoływana przy SUBMIT
     */
    async addNewItem(newItem, serverFunctionName, viewObject) {
        let newItemTmpId = `${this.items.length + 1}_pending`;
        newItem._tmpId = newItemTmpId;
        const noBlobNewItem = Tools.cloneOfObject(newItem);
        delete noBlobNewItem._blobEnviObjects;
        this.currentItem = noBlobNewItem;
        //wstaw roboczy obiekt do repozytorium, żeby obsłużyć widok
        this.items.push(noBlobNewItem);
        viewObject.addNewHandler.apply(viewObject, ["PENDING", noBlobNewItem]);
        try {
            let newItemFromServer = await this.editItemResponseHandlerGAS(newItem, serverFunctionName);
            return this.addNewItemViewOnSuccessHandler(newItemTmpId, newItemFromServer, viewObject, serverFunctionName);
        }
        catch (err) {
            if (err instanceof Error) {
                this.addNewItemViewOnErrorHandler(newItemTmpId, viewObject, noBlobNewItem, err);
                throw (err);
            }
        }
        ;
    }
    async addNewItemNodeJS(newItem, route, viewObject) {
        const newItemTmpId = this.items.length + 1 + '_pending';
        newItem._tmpId = newItemTmpId;
        const noBlobNewItem = Tools.cloneOfObject(newItem);
        delete noBlobNewItem._blobEnviObjects;
        this.currentItem = noBlobNewItem;
        //wstaw roboczy obiekt do repozytorium, żeby obsłużyć widok
        this.items.push(noBlobNewItem);
        viewObject.addNewHandler.apply(viewObject, ["PENDING", newItem]);
        try {
            let newItemFromServer = await this.addNewItemResponseHandlerNodeJS(newItem, route);
            return this.addNewItemViewOnSuccessHandler(newItemTmpId, newItemFromServer, viewObject);
        }
        catch (err) {
            if (err instanceof Error) {
                this.addNewItemViewOnErrorHandler(newItemTmpId, viewObject, noBlobNewItem, err);
                throw (err);
            }
        }
        ;
    }
    addNewItemViewOnSuccessHandler(newItemTmpId, newItemFromServer, viewObject, serverFunctionName = '') {
        //usuń z repozytorium tymczasowy obiekt
        const index = this.items.findIndex((item) => item._tmpId == newItemTmpId);
        console.log('usuwam obiekt tymczasowy, jego _parent: %o', this.items[index]._parent);
        this.items.splice(index, 1);
        //wstaw do repozytorium nowy obiekt z serwera
        this.clientSideAddNewItemHandler(newItemFromServer, serverFunctionName);
        //atrybut '_tmpId' jest potrzebny do obsłużenia viewObject
        newItemFromServer._tmpId = newItemTmpId;
        viewObject.addNewHandler.apply(viewObject, ["DONE", newItemFromServer]);
        return newItemFromServer;
    }
    addNewItemViewOnErrorHandler(newItemTmpId, viewObject, newItem, err) {
        //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
        //usuń z repozytorium pechowy obiekt
        var index = this.items.findIndex((item) => item._tmpid == newItemTmpId);
        this.items.splice(index, 1);
        this.currentItem = {};
        viewObject.addNewHandler.apply(viewObject, ["ERROR", newItem, err]);
    }
    async editItemResponseHandlerGAS(newItem, serverFunctionName) {
        let result;
        // Create an execution request object.
        // Create execution request.
        let request = {
            'function': serverFunctionName,
            'parameters': JSON.stringify(newItem),
            'devMode': true // Optional.
        };
        // Make the API request.
        let resp = (await gapi.client.request({
            //@ts-ignore
            'root': 'https://script.googleapis.com',
            'path': 'v1/scripts/' + SCRIPT_ID + ':run',
            'method': 'POST',
            'body': request
        })).result;
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            result = 'Error calling API:';
            result += JSON.stringify(resp, null, 2);
            console.error(resp.error);
            throw result;
            //throw resp.error;
        }
        else if (resp.error) {
            // The API executed, but the script returned an error.
            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            result = 'Script error message: ' + error.errorMessage;
            throw resp.error.details[0].errorMessage;
            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                result = 'Script error stacktrace:';
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    result += ('\t' + trace.function + ':' + trace.lineNumber);
                }
                throw resp.error.details[0].errorMessage;
            }
        }
        else {
            // The structure of the result will depend upon what the Apps
            // Script function returns. 
            if (!resp.done) {
                throw "Nic nie dodano";
            }
            else {
                result = 'Dodano element';
                return (resp.response.result);
            }
        }
    }
    /*
     * wywoływana przy SUBMIT
     * @param {DataItem} newItem
     * @param {String} serverFunctionName
     * @param {Collection | Collapsible} viewObject
     * @returns {Promise}
     */
    async editItem(newItem, serverFunctionName, viewObject) {
        viewObject.editHandler.apply(viewObject, ["PENDING", newItem]);
        try {
            let result = await this.editItemResponseHandlerGAS(newItem, serverFunctionName);
            return this.editItemViewHandler(result, viewObject);
        }
        catch (err) {
            //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
            viewObject.editHandler.apply(viewObject, ["ERROR", newItem, err]);
            throw err;
        }
        ;
    }
    async editItemNodeJS(newItem, route, viewObject) {
        viewObject.editHandler.apply(viewObject, ["PENDING", newItem]);
        try {
            let newItemFromServer = await this.editItemResponseHandlerNodeJS(newItem, route);
            return this.editItemViewHandler(newItemFromServer, viewObject);
        }
        catch (err) {
            //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
            viewObject.editHandler.apply(viewObject, ["ERROR", newItem, err]);
            throw err;
        }
        ;
    }
    editItemViewHandler(newItemFromServer, viewObject) {
        if (!newItemFromServer)
            throw new Error('Serwer powinien zwrócić obiekt');
        //usuń z repozytorium tymczasowy obiekt
        var index = this.items.findIndex((item) => item.id == newItemFromServer.id);
        this.items.splice(index, 1);
        //wstaw do repozytorium nowy obiekt z serwera
        this.items.push(newItemFromServer);
        this.currentItem = newItemFromServer;
        viewObject.editHandler.apply(viewObject, ["DONE", newItemFromServer]);
        return (newItemFromServer);
    }
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    async addNewItemResponseHandlerNodeJS(item, route) {
        const result = await fetch(MainSetup.serverUrl + route, {
            method: 'POST',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(item)
        });
        const resultText = await result.text();
        if (resultText.authorizeUrl)
            window.open(resultText.authorizeUrl);
        else {
            const parsedResult = Tools.tryParseJSONObject(resultText);
            if (parsedResult)
                return parsedResult;
            else
                return resultText;
        }
    }
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    async editItemResponseHandlerNodeJS(item, route) {
        let result = await fetch(MainSetup.serverUrl + route + '/' + item.id, {
            method: 'PUT',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(item)
        });
        const resultText = await result.text();
        if (resultText.authorizeUrl)
            window.open(resultText.authorizeUrl);
        return JSON.parse(resultText);
    }
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    async deleteItemResponseHandlerNodeJS(oldItem, route) {
        let result = await fetch(MainSetup.serverUrl + route + '/' + oldItem.id, {
            method: 'DELETE',
            headers: this.makeRequestHeaders(),
            credentials: 'include',
            body: JSON.stringify(oldItem)
        });
        if (result.authorizeUrl)
            window.open(result.authorizeUrl);
        return result;
    }
    makeRequestHeaders() {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return myHeaders;
    }
    /*
     * Do serwera idzie cały Item, do Kroku 3 idzie tylko item.id
     */
    async deleteItem(oldItem, serverFunctionName, viewObject) {
        this.clientSideDeleteItemHandler(oldItem);
        viewObject.removeHandler.apply(viewObject, ["PENDING", oldItem.id]);
        try {
            let result = await this.deleteItemResponseHandlerGAS(oldItem, serverFunctionName);
            viewObject.removeHandler.apply(viewObject, ["DONE", oldItem.id, undefined, result]);
            return oldItem;
        }
        catch (err) {
            this.items.push(oldItem);
            this.currentItem = oldItem;
            viewObject.removeHandler.apply(viewObject, ["ERROR", oldItem.id, err]);
        }
    }
    async deleteItemNodeJS(oldItem, route, viewObject) {
        this.clientSideDeleteItemHandler(oldItem);
        viewObject.removeHandler.apply(viewObject, ["PENDING", oldItem.id]);
        try {
            let result = await this.deleteItemResponseHandlerNodeJS(oldItem, route);
            viewObject.removeHandler.apply(viewObject, ["DONE", oldItem.id, undefined, result]);
            return oldItem;
        }
        catch (err) {
            this.items.push(oldItem);
            this.currentItem = oldItem;
            viewObject.removeHandler.apply(viewObject, ["ERROR", oldItem.id, err]);
        }
    }
    async deleteItemResponseHandlerGAS(oldItem, serverFunctionName) {
        let result;
        // Create an execution request object.
        // Create execution request.
        const request = {
            'function': serverFunctionName,
            'parameters': JSON.stringify(oldItem),
            'devMode': true // Optional.
        };
        // Make the API request.
        let resp = (await gapi.client.request({
            //@ts-ignore
            root: 'https://script.googleapis.com',
            path: 'v1/scripts/' + SCRIPT_ID + ':run',
            method: 'POST',
            body: request
        })).result;
        if (resp.error && resp.error.status) {
            // The API encountered a problem before the script
            // started executing.
            result = 'Error calling API:';
            result += JSON.stringify(resp, null, 2);
            console.error(resp.error);
            throw result;
            //throw resp.error;
        }
        else if (resp.error) {
            // The API executed, but the script returned an error.
            // Extract the first (and only) set of error details.
            // The values of this object are the script's 'errorMessage' and
            // 'errorType', and an array of stack trace elements.
            var error = resp.error.details[0];
            result = 'Script error message: ' + error.errorMessage;
            console.error(resp.error);
            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start
                // executing.
                result = 'Script error stacktrace:';
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    result += ('\t' + trace.function + ':' + trace.lineNumber);
                }
                throw resp.error.details[0].errorMessage;
            }
        }
        else {
            // The structure of the result will depend upon what the Apps
            // Script function returns. 
            if (!resp.done) {
                throw this.name + ": nic nie usunięto";
            }
            else {
                //this.result = resp.response.result;
                return (resp.response.result);
            }
        }
    }
}
