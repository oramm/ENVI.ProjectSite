"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var SimpleRepository = /** @class */ (function (_super) {
    __extends(SimpleRepository, _super);
    /*
     *
     * @param {String || Object} initParameter może to być nazwa repozytorim, albo obiekt z session Strorage
     * @param {String} addNewServerFunctionName
     * @param {String} editServerFunctionName
     * @param {String} deleteServerFunctionName
     * @returns {SimpleRepository}
     */
    function SimpleRepository(initParameter, addNewServerFunctionName, editServerFunctionName, deleteServerFunctionName, copyServerFunctionName) {
        if (copyServerFunctionName === void 0) { copyServerFunctionName = addNewServerFunctionName; }
        var _this = _super.call(this, initParameter) || this;
        if (initParameter.parentItemId)
            _this.parentItemId = initParameter.parentItemId;
        else
            _this.parentItemIdFromURL();
        //stary typ repozytium
        if (typeof initParameter === 'string' && !initParameter.actionsNodeJSSetup) {
            _this.addNewServerFunctionName = addNewServerFunctionName;
            _this.editServerFunctionName = editServerFunctionName;
            _this.deleteServerFunctionName = deleteServerFunctionName;
            _this.copyServerFunctionName = copyServerFunctionName;
            sessionStorage.setItem(_this.name, JSON.stringify(_this));
        }
        //mamy obiekt z SessionStorage lub nowy obiekt z nodeJS
        else if (typeof initParameter === 'object') {
            _this.addNewServerFunctionName = initParameter.addNewServerFunctionName;
            _this.editServerFunctionName = initParameter.editServerFunctionName;
            _this.deleteServerFunctionName = initParameter.deleteServerFunctionName;
        }
        return _this;
    }
    SimpleRepository.prototype.initialiseNodeJS = function (requestParams) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'GET',
                url: MainSetup.serverUrl + requestParams,
                success: function (response) {
                    _this.items = response;
                    sessionStorage.setItem(_this.name, JSON.stringify(_this));
                    console.log(_this.name + ' NodeJS: %o', response);
                    resolve(_this.name + " initialised");
                },
                error: function (xhr, status, err) {
                    console.log(xhr.responseText);
                    alert(xhr.responseText);
                }
            });
        });
    };
    //najczęściej jest to projectId
    SimpleRepository.prototype.parentItemIdFromURL = function () {
        this.parentItemId = Tools.getUrlVars()['parentItemId'];
    };
    //Krok 2 - wywoływana przy SUBMIT
    SimpleRepository.prototype.addNewItem = function (dataItem, viewObject) {
        return this.doAddNewFunctionOnItem(dataItem, this.addNewServerFunctionName, viewObject);
        //super.addNewItem(dataItem, this.addNewServerFunctionName, viewObject);
    };
    //Krok 2 - wywoływana przy SUBMIT
    SimpleRepository.prototype.editItem = function (dataItem, viewObject) {
        var argument = (this.actionsNodeJSSetup.editRoute) ? this.actionsNodeJSSetup.editRoute : this.editServerFunctionName;
        return this.doChangeFunctionOnItem(dataItem, argument, viewObject);
    };
    /*
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Resultset
     */
    SimpleRepository.prototype.deleteItem = function (dataItem, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.actionsNodeJSSetup.deleteRoute) return [3 /*break*/, 2];
                        return [4 /*yield*/, _super.prototype.deleteItemNodeJS.call(this, dataItem, this.actionsNodeJSSetup.deleteRoute, viewObject)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _super.prototype.deleteItem.call(this, dataItem, this.deleteServerFunctionName, viewObject)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.name + ': item deleted'];
                }
            });
        });
    };
    SimpleRepository.prototype.copyCurrentItem = function (viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.copyItem(this.currentItem, viewObject)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SimpleRepository.prototype.copyItem = function (dataItem, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var tmpDataObject, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tmpDataObject = Tools.cloneOfObject(dataItem);
                        tmpDataObject.id = undefined;
                        if (!this.actionsNodeJSSetup.copyRoute) return [3 /*break*/, 2];
                        return [4 /*yield*/, _super.prototype.addNewItemNodeJS.call(this, dataItem, this.actionsNodeJSSetup.copyRoute, viewObject)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _super.prototype.addNewItem.call(this, tmpDataObject, this.copyServerFunctionName, viewObject)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, result];
                }
            });
        });
    };
    /*
     * wykonuje dowolną funkcję z serwera dotyczącą danej pozycji na liście viewObject
     */
    SimpleRepository.prototype.doChangeFunctionOnItem = function (dataItem, serverFunctionNameOrRoute, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var result, newIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.actionsNodeJSSetup.editRoute) return [3 /*break*/, 2];
                        return [4 /*yield*/, _super.prototype.editItemNodeJS.call(this, dataItem, serverFunctionNameOrRoute, viewObject)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _super.prototype.editItem.call(this, dataItem, serverFunctionNameOrRoute, viewObject)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        newIndex = this.items.findIndex(function (item) { return item.id == result.id; });
                        this.items[newIndex] = result;
                        console.log('%s:: wykonano funkcję: %s', this.name, serverFunctionNameOrRoute, result);
                        return [2 /*return*/, (result)];
                }
            });
        });
    };
    /*
     * wykonuje dowolną funkcję  z serwera polegającą na utworzeniu pozycji na liście viewObject
     */
    SimpleRepository.prototype.doAddNewFunctionOnItem = function (dataItem, serverFunctionName, viewObject) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.actionsNodeJSSetup.addNewRoute) return [3 /*break*/, 2];
                        return [4 /*yield*/, _super.prototype.addNewItemNodeJS.call(this, dataItem, this.actionsNodeJSSetup.addNewRoute, viewObject)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, _super.prototype.addNewItem.call(this, dataItem, serverFunctionName, viewObject)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4:
                        console.log('%s:: wykonano funkcję: %s, %o', this.name, serverFunctionName, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return SimpleRepository;
}(Repository));
;
