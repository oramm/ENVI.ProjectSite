"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Repository = /** @class */ (function () {
    /*
     * Może być inicjowane z danych z serwera, wtedy argumentem jest name jako string
     * Może być też inicjowane z obiektu SessionStorage, wtedy paremetrem jest ten obiekt
     * @param {type} name
     * @returns {Repository}
     */
    function Repository(initParameter) {
        if (initParameter === undefined)
            throw new SyntaxError("Repository must have a name!");
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
        this.itemsLocalData;
        this.result;
        //Repository może mieć wiele bieżących elementów (multiselect)
        this.currentItemsLocalData = [];
        this.currentItemLocalData = (initParameter.currentItemLocalData) ? initParameter.currentItemLocalData : {};
        if (typeof initParameter === 'string') {
            //przemyśleć i w przyszłości może scalić z currentItemsLocalData[]
            this.name = initParameter;
            //sessionStorage.setItem(this.name, JSON.stringify(this));
        }
        //mamy obiekt z SessionStorage lub z nodeJS
        else if (typeof initParameter === 'object') {
            this.name = initParameter.name;
            this.actionsGASSetup = initParameter.actionsGASSetup;
            this.actionsNodeJSSetup = initParameter.actionsNodeJSSetup;
            if (initParameter.itemsLocalData) {
                this.itemsLocalData = initParameter.itemsLocalData;
                console.log(this.name + ' items from SessionStorage: %o', this.itemsLocalData);
            }
            else {
            }
        }
    }
    Object.defineProperty(Repository.prototype, "items", {
        get: function () {
            return (this.itemsLocalData) ? this.itemsLocalData : JSON.parse(sessionStorage.getItem(this.name)).itemsLocalData;
        },
        set: function (data) {
            this.itemsLocalData = data;
            sessionStorage.setItem(this.name, JSON.stringify(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "currentItem", {
        get: function () {
            return (this.currentItemLocalData) ? this.currentItemLocalData : JSON.parse(sessionStorage.getItem(this.name)).currentItem;
        },
        set: function (item) {
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
            if (item !== {})
                this.addToCurrentItems(item);
            sessionStorage.setItem(this.name, JSON.stringify(this));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Repository.prototype, "currentItems", {
        //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
        get: function () {
            return (this.currentItemsLocalData) ? this.currentItemsLocalData : JSON.parse(sessionStorage.getItem(this.name)).currentItems;
        },
        set: function (data) {
            this.currentItemsLocalData = data;
            sessionStorage.setItem(this.name, JSON.stringify(this));
        },
        enumerable: false,
        configurable: true
    });
    //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
    Repository.prototype.addToCurrentItems = function (newDataItem) {
        if (newDataItem) {
            if (this.currentItemsLocalData && this.currentItemsLocalData[0])
                var wasItemAlreadySelected = this.currentItemsLocalData.filter(function (existingDataItem) { return existingDataItem.id == newDataItem.id; })[0];
            if (!wasItemAlreadySelected)
                this.currentItemsLocalData.push(newDataItem);
        }
        //sessionStorage.setItem(this.name, JSON.stringify(this));
    };
    //używać tylko gdy Repository ma wiele bieżących elementów (multiselect)
    Repository.prototype.deleteFromCurrentItems = function (item) {
        if (!item || typeof item !== 'object')
            throw new SyntaxError("Selected item must be an object!");
        var index = Tools.arrGetIndexOf(this.currentItemsLocalData, 'id', item.id);
        if (index !== undefined)
            this.currentItemsLocalData.splice(index, 1);
        sessionStorage.setItem(this.name, JSON.stringify(this));
    };
    Repository.prototype.setCurrentItemById = function (id) {
        if (id === undefined)
            throw new SyntaxError("Selected item id must be specified!");
        this.currentItemId = id;
        this.currentItem = Tools.search(parseInt(id), "id", this.items);
    };
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    Repository.prototype.clientSideEditItemHandler = function (dataItem) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var newIndex = _this.items.findIndex(function (item) { return item.id == dataItem.id; });
            _this.items[newIndex] = dataItem;
            console.log('%s:: wykonano funkcję: %s, %o', _this.name, _this, dataItem);
            resolve(dataItem);
        });
    };
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    Repository.prototype.clientSideAddNewItemHandler = function (dataItem, serverFunctionName) {
        var _this = this;
        if (serverFunctionName === void 0) { serverFunctionName = ''; }
        return new Promise(function (resolve, reject) {
            _this.items.push(dataItem);
            console.log('dodaję obiekt docelowy, jego parent: ,%o', dataItem._parent);
            _this.currentItem = dataItem;
            console.log('%s:: wykonano funkcję: %s, %o', _this.name, serverFunctionName, dataItem);
            resolve(dataItem);
        });
    };
    /*
     * używany do ustawienia repozytorium po stronie klienta (bez obsługi viewObject)
     * gdy edytujemy element nieposiadający listy
     */
    Repository.prototype.clientSideDeleteItemHandler = function (dataItem) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                index = this.items.findIndex(function (item) { return item.id == dataItem.id; });
                this.items.splice(index, 1);
                this.currentItem = {};
                console.log('%s:: wykonano funkcję: %s, %o', this.name, this.deleteServerFunctionName, dataItem);
                return [2 /*return*/, dataItem];
            });
        });
    };
    Repository.prototype.doServerFunction = function (serverFunctionName, serverFunctionParameters) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Create an execution request object.
            // Create execution request.
            var request = {
                'function': serverFunctionName,
                'parameters': serverFunctionParameters,
                'devMode': true // Optional.
            };
            // Make the API request.
            var op = gapi.client.request({
                'root': 'https://script.googleapis.com',
                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                'method': 'POST',
                'body': request
            });
            op
                .then(function (resp) { return _this.handleDoServerFunction(resp.result); })
                .then(function (result) {
                console.log(_this.name + ' ' + serverFunctionName + '() items from db: %o ', result);
                resolve(result);
            })
                .catch(function (err) {
                console.error(serverFunctionName, err);
                window.alert('Wystąił Błąd! \n ' + err);
                throw err;
            });
        });
    };
    //TODO: scalić funkcje handleDoServerFunction() z handleAddNewItem
    Repository.prototype.handleDoServerFunction = function (resp) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (resp.error && resp.error.status) {
                // The API encountered a problem before the script
                // started executing.
                _this.result = 'Error calling API:';
                _this.result += JSON.stringify(resp);
                console.error(resp.error);
                throw _this.result;
                //throw resp.error;
            }
            else if (resp.error) {
                // The API executed, but the script returned an error.
                // Extract the first (and only) set of error details.
                // The values of this object are the script's 'errorMessage' and
                // 'errorType', and an array of stack trace elements.
                var error = resp.error.details[0];
                _this.result = 'Script error message: ' + error.errorMessage;
                console.error(resp.error);
                if (error.scriptStackTraceElements) {
                    // There may not be a stacktrace if the script didn't start
                    // executing.
                    _this.result = 'Script error stacktrace:';
                    for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                        var trace = error.scriptStackTraceElements[i];
                        _this.result += ('\t' + trace.function + ':' + trace.lineNumber);
                    }
                    throw resp.error.details[0].errorMessage;
                }
            }
            else {
                // The structure of the result will depend upon what the Apps
                // Script function returns. 
                var serverResponse = resp.response.result;
                if (!serverResponse || Object.keys(serverResponse).length == 0) {
                    _this.result = [];
                    resolve(_this.result);
                }
                else {
                    //itemsList = serverResponse;
                    _this.result = _this.name + '  succes';
                    resolve(serverResponse);
                }
            }
        });
    };
    /*
     * wywoływana przy SUBMIT
     */
    Repository.prototype.addNewItem = function (newItem, serverFunctionName, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var newItemTmpId, newItemFromServer, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newItemTmpId = this.items.length + 1 + '_pending';
                        newItem._tmpId = newItemTmpId;
                        //wstaw roboczy obiekt do repozytorium, żeby obsłużyć widok
                        this.items.push(newItem);
                        console.log('tworzę obiekt tymczasowy, jego parent: %o', newItem._parent);
                        this.currentItem = Tools.cloneOfObject(newItem);
                        viewObject.addNewHandler.apply(viewObject, ["PENDING", newItem]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.editItemResponseHandlerGAS(newItem, serverFunctionName)];
                    case 2:
                        newItemFromServer = _a.sent();
                        return [2 /*return*/, this.addNewItemViewOnSuccesHandler(newItemTmpId, newItemFromServer, viewObject, serverFunctionName)];
                    case 3:
                        err_1 = _a.sent();
                        this.addNewItemViewOnErrorHandler(newItemTmpId, viewObject, newItem, err_1);
                        throw (err_1);
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.addNewItemNodeJS = function (newItem, route, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var newItemTmpId, newItemFromServer, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newItemTmpId = this.items.length + 1 + '_pending';
                        newItem._tmpId = newItemTmpId;
                        //wstaw roboczy obiekt do repozytorium, żeby obsłużyć widok
                        this.items.push(newItem);
                        console.log('tworzę obiekt tymczasowy, jego parent: %o', newItem._parent);
                        this.currentItem = Tools.cloneOfObject(newItem);
                        viewObject.addNewHandler.apply(viewObject, ["PENDING", newItem]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.addNewItemResponseHandlerNodeJS(newItem, route)];
                    case 2:
                        newItemFromServer = _a.sent();
                        return [2 /*return*/, this.addNewItemViewOnSuccesHandler(newItemTmpId, newItemFromServer, viewObject)];
                    case 3:
                        err_2 = _a.sent();
                        this.addNewItemViewOnErrorHandler(newItemTmpId, viewObject, newItem, err_2);
                        throw (err_2);
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.addNewItemViewOnSuccesHandler = function (newItemTmpId, newItemFromServer, viewObject, serverFunctionName) {
        if (serverFunctionName === void 0) { serverFunctionName = ''; }
        //usuń z repozytorium tymczasowy obiekt
        var index = this.items.findIndex(function (item) { return item._tmpId == newItemTmpId; });
        console.log('usuwam obiekt tymczasowy, jego _parent: %o', this.items[index]._parent);
        this.items.splice(index, 1);
        //wstaw do repozytorium nowy obiekt z serwera
        this.clientSideAddNewItemHandler(newItemFromServer, serverFunctionName);
        //atrybut '_tmpId' jest potrzebny do obsłużenia viewObject
        newItemFromServer._tmpId = newItemTmpId;
        viewObject.addNewHandler.apply(viewObject, ["DONE", newItemFromServer]);
        return newItemFromServer;
    };
    Repository.prototype.addNewItemViewOnErrorHandler = function (newItemTmpId, viewObject, newItem, err) {
        //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
        //usuń z repozytorium pechowy obiekt
        var index = this.items.findIndex(function (item) { return item._tmpid == newItemTmpId; });
        this.items.splice(index, 1);
        this.currentItem = {};
        viewObject.addNewHandler.apply(viewObject, ["ERROR", newItem, err]);
    };
    Repository.prototype.editItemResponseHandlerGAS = function (newItem, serverFunctionName) {
        return __awaiter(this, void 0, void 0, function () {
            var request, resp, error, i, trace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            'function': serverFunctionName,
                            'parameters': JSON.stringify(newItem),
                            'devMode': true // Optional.
                        };
                        return [4 /*yield*/, gapi.client.request({
                                'root': 'https://script.googleapis.com',
                                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                                'method': 'POST',
                                'body': request
                            })];
                    case 1:
                        resp = (_a.sent()).result;
                        if (resp.error && resp.error.status) {
                            // The API encountered a problem before the script
                            // started executing.
                            this.result = 'Error calling API:';
                            this.result += JSON.stringify(resp, null, 2);
                            console.error(resp.error);
                            throw this.result;
                            //throw resp.error;
                        }
                        else if (resp.error) {
                            error = resp.error.details[0];
                            this.result = 'Script error message: ' + error.errorMessage;
                            throw resp.error.details[0].errorMessage;
                            if (error.scriptStackTraceElements) {
                                // There may not be a stacktrace if the script didn't start
                                // executing.
                                this.result = 'Script error stacktrace:';
                                for (i = 0; i < error.scriptStackTraceElements.length; i++) {
                                    trace = error.scriptStackTraceElements[i];
                                    this.result += ('\t' + trace.function + ':' + trace.lineNumber);
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
                                this.result = 'Dodano element';
                                return [2 /*return*/, (resp.response.result)];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * wywoływana przy SUBMIT
     * @param {DataItem} newItem
     * @param {String} serverFunctionName
     * @param {Collection | Collapsible} viewObject
     * @returns {Promise}
     */
    Repository.prototype.editItem = function (newItem, serverFunctionName, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewObject.editHandler.apply(viewObject, ["PENDING", newItem]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.editItemResponseHandlerGAS(newItem, serverFunctionName)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, this.editItemViewHandler(result, viewObject)];
                    case 3:
                        err_3 = _a.sent();
                        //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
                        viewObject.editHandler.apply(viewObject, ["ERROR", newItem, err_3]);
                        throw err_3;
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.editItemNodeJS = function (newItem, route, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var newItemFromServer, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewObject.editHandler.apply(viewObject, ["PENDING", newItem]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.editItemResponseHandlerNodeJS(newItem, route)];
                    case 2:
                        newItemFromServer = _a.sent();
                        return [2 /*return*/, this.editItemViewHandler(newItemFromServer, viewObject)];
                    case 3:
                        err_4 = _a.sent();
                        //http://javascriptissexy.com/understand-javascript-callback-functions-and-use-them/
                        viewObject.editHandler.apply(viewObject, ["ERROR", newItem, err_4]);
                        throw err_4;
                    case 4:
                        ;
                        return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.editItemViewHandler = function (newItemFromServer, viewObject) {
        if (!newItemFromServer)
            throw new Error('Serwer powinien zwrócić obiekt');
        //usuń z repozytorium tymczasowy obiekt
        var index = this.items.findIndex(function (item) { return item.id == newItemFromServer.id; });
        this.items.splice(index, 1);
        //wstaw do repozytorium nowy obiekt z serwera
        this.items.push(newItemFromServer);
        this.currentItem = newItemFromServer;
        viewObject.editHandler.apply(viewObject, ["DONE", newItemFromServer]);
        return (newItemFromServer);
    };
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    Repository.prototype.addNewItemResponseHandlerNodeJS = function (item, route) {
        return __awaiter(this, void 0, void 0, function () {
            var result, parsedResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(MainSetup.serverUrl + route, {
                            method: 'POST',
                            headers: this.makeRequestHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(item)
                        })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        result = _a.sent();
                        if (result.authorizeUrl)
                            window.open(result.authorizeUrl);
                        else {
                            parsedResult = Tools.tryParseJSONObject(result);
                            if (parsedResult)
                                return [2 /*return*/, parsedResult];
                            else
                                return [2 /*return*/, result];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    Repository.prototype.editItemResponseHandlerNodeJS = function (item, route) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(MainSetup.serverUrl + route + '/' + item.id, {
                            method: 'PUT',
                            headers: this.makeRequestHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(item)
                        })];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, result.text()];
                    case 2:
                        result = _a.sent();
                        if (result.authorizeUrl)
                            window.open(result.authorizeUrl);
                        return [2 /*return*/, JSON.parse(result)];
                }
            });
        });
    };
    //https://github.com/expressjs/session/issues/374#issuecomment-279653974
    Repository.prototype.deleteItemResponseHandlerNodeJS = function (oldItem, route) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(MainSetup.serverUrl + route + '/' + oldItem.id, {
                            method: 'DELETE',
                            headers: this.makeRequestHeaders(),
                            credentials: 'include',
                            body: JSON.stringify(oldItem)
                        })];
                    case 1:
                        result = _a.sent();
                        if (result.authorizeUrl)
                            window.open(result.authorizeUrl);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Repository.prototype.makeRequestHeaders = function () {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        return myHeaders;
    };
    /*
     * Do serwera idzie cały Item, do Kroku 3 idzie tylko item.id
     */
    Repository.prototype.deleteItem = function (oldItem, serverFunctionName, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clientSideDeleteItemHandler(oldItem);
                        viewObject.removeHandler.apply(viewObject, ["PENDING", oldItem.id]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.deleteItemResponseHandlerGAS(oldItem, serverFunctionName)];
                    case 2:
                        result = _a.sent();
                        viewObject.removeHandler.apply(viewObject, ["DONE", oldItem.id, undefined, result]);
                        return [2 /*return*/, oldItem];
                    case 3:
                        err_5 = _a.sent();
                        this.items.push(oldItem);
                        this.currentItem = oldItem;
                        viewObject.removeHandler.apply(viewObject, ["ERROR", oldItem.id, err_5]);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.deleteItemNodeJS = function (oldItem, route, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.clientSideDeleteItemHandler(oldItem);
                        viewObject.removeHandler.apply(viewObject, ["PENDING", oldItem.id]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.deleteItemResponseHandlerNodeJS(oldItem, route)];
                    case 2:
                        result = _a.sent();
                        viewObject.removeHandler.apply(viewObject, ["DONE", oldItem.id, undefined, result]);
                        return [2 /*return*/, oldItem];
                    case 3:
                        err_6 = _a.sent();
                        this.items.push(oldItem);
                        this.currentItem = oldItem;
                        viewObject.removeHandler.apply(viewObject, ["ERROR", oldItem.id, err_6]);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Repository.prototype.deleteItemResponseHandlerGAS = function (oldItem, serverFunctionName) {
        return __awaiter(this, void 0, void 0, function () {
            var request, resp, error, i, trace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            'function': serverFunctionName,
                            'parameters': JSON.stringify(oldItem),
                            'devMode': true // Optional.
                        };
                        return [4 /*yield*/, gapi.client.request({
                                'root': 'https://script.googleapis.com',
                                'path': 'v1/scripts/' + SCRIPT_ID + ':run',
                                'method': 'POST',
                                'body': request
                            })];
                    case 1:
                        resp = (_a.sent()).result;
                        if (resp.error && resp.error.status) {
                            // The API encountered a problem before the script
                            // started executing.
                            this.result = 'Error calling API:';
                            this.result += JSON.stringify(resp, null, 2);
                            console.error(resp.error);
                            throw this.result;
                            //throw resp.error;
                        }
                        else if (resp.error) {
                            error = resp.error.details[0];
                            this.result = 'Script error message: ' + error.errorMessage;
                            console.error(resp.error);
                            if (error.scriptStackTraceElements) {
                                // There may not be a stacktrace if the script didn't start
                                // executing.
                                this.result = 'Script error stacktrace:';
                                for (i = 0; i < error.scriptStackTraceElements.length; i++) {
                                    trace = error.scriptStackTraceElements[i];
                                    this.result += ('\t' + trace.function + ':' + trace.lineNumber);
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
                                return [2 /*return*/, (resp.response.result)];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Repository;
}());
