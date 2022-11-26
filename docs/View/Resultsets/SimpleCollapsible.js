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
var SimpleCollapsible = /** @class */ (function (_super) {
    __extends(SimpleCollapsible, _super);
    function SimpleCollapsible(initParamObject) {
        var _this = this;
        if (initParamObject.subitemsCount && typeof initParamObject.subitemsCount !== 'number')
            throw SyntaxError('subitemsCount must be a number!');
        _this = _super.call(this, initParamObject) || this;
        _this.$bodyDoms = [];
        return _this;
    }
    /*
     * Krok 1 - po kliknięciu w przycisk 'usuń'
     * Proces: this.removeTrigger >> xxxxRepository.deleteItem()
     *                                      >> repository.deleteItem >> collection.removeHandler[PENDING]
     *                                      >> repository.deleteItem >> collection.removeHandler[DONE]

     */
    SimpleCollapsible.prototype.removeTrigger = function (itemId) {
        var item = Tools.search(parseInt(itemId), "id", this.connectedRepository.items);
        this.connectedRepository.deleteItem(item, this)
            .catch(function (err) {
            console.error(err);
        });
    };
    SimpleCollapsible.prototype.selectTrigger = function (itemId) {
        this.connectedRepository.setCurrentItemById(itemId);
    };
    return SimpleCollapsible;
}(Collapsible));
