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
var SimpleCollection = /** @class */ (function (_super) {
    __extends(SimpleCollection, _super);
    /*
     *
     * @param {String} id - używane w HTML musi być unikatowe
     * @param {Repository} connectedRepository
     * @param {Boolean} isPlane
     * @returns {SimpleCollection}
     */
    function SimpleCollection(initParamObject) {
        var _this = _super.call(this, initParamObject) || this;
        _this.connectedRepository = initParamObject.connectedRepository;
        return _this;
        //this.initialise(this.makeList());
    }
    SimpleCollection.prototype.makeList = function () {
        var itemsList = [];
        for (var _i = 0, _a = this.connectedRepository.items; _i < _a.length; _i++) {
            var dataItem = _a[_i];
            itemsList.push(this.makeItem(dataItem));
        }
        return itemsList;
    };
    /*
     * Krok 3 -  callback z repository - obsługuje wyświetlanie podczas łączenia z serwerem
     * przekaż proces do obiektu 'Collection' i obsłuż w zależności od statusu odpowiedzi z serwera
     * Krok 3 jest w obiekcie Collection.addNewHandler
    */
    SimpleCollection.prototype.addNewHandler = function (status, dataItem, errorMessage) {
        var collectionItem = this.makeItem(dataItem);
        collectionItem._tmpId = dataItem._tmpId;
        return _super.prototype.addNewHandler.call(this, status, collectionItem, errorMessage);
    };
    /*
     * Krok 3 -  callback z repository - obsługuje wyświetlanie podczas łączenia z serwerem
     * przekaż proces do obiektu 'Collection' i obsłuż w zależności od statusu odpowiedzi z serwera
     * Krok 3 jest w obiekcie Collection.addNewHandler
    */
    SimpleCollection.prototype.editHandler = function (status, dataItem, errorMessage) {
        var collectionItem = this.makeItem(dataItem);
        _super.prototype.editHandler.call(this, status, collectionItem, errorMessage);
    };
    /*
     * Krok 1 - po kliknięciu w przycisk 'usuń'
     * Proces: this.removeTrigger >> xxxxRepository.deleteItem()
     *                                      >> repository.deleteItem >> collection.removeHandler[PENDING]
     *                                      >> repository.deleteItem >> collection.removeHandler[DONE]

     */
    SimpleCollection.prototype.removeTrigger = function (itemId) {
        var item = Tools.search(parseInt(itemId), "id", this.connectedRepository.items);
        this.connectedRepository.deleteItem(item, this)
            .catch(function (err) {
            console.error(err);
            throw err;
        });
    };
    SimpleCollection.prototype.selectTrigger = function (itemId) {
        this.connectedRepository.setCurrentItemById(itemId);
    };
    return SimpleCollection;
}(Collection));
