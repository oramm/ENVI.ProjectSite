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
/*
 * http://materializecss.com/collapsible.html
 */
var Collapsible = /** @class */ (function (_super) {
    __extends(Collapsible, _super);
    function Collapsible(initParamObject) {
        var _this_1 = _super.call(this, initParamObject) || this;
        _this_1.isExpandable = (initParamObject.isExpandable === undefined) ? false : initParamObject.isExpandable;
        _this_1.isMultiSelectable = initParamObject.isMultiSelectable;
        _this_1.hasArchiveSwitch = initParamObject.hasArchiveSwitch;
        _this_1.subitemsCount = initParamObject.subitemsCount;
        _this_1.currentItems = []; //wybrany wiersz
        _this_1.$collapsible;
        //buduję szkielet, żeby podpiąć modale do $dom, 
        //na założeniu, że dom powstaje w konstruktorze bazuje Modal.buildDom()
        _this_1.$dom = $('<div>')
            .attr('id', 'container' + '_' + _this_1.id);
        _this_1.$collapsible = $('<ul class="collapsible">');
        _this_1.$collapsible.attr('id', _this_1.id);
        _this_1.$collapsible.attr('data-collapsible', (_this_1.isExpandable) ? 'expandable' : 'accordion');
        _this_1.$title = $('<div class="resultset-title">');
        _this_1.$title.text(_this_1.title);
        _this_1.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + _this_1.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');
        _this_1.filter = new Filter(_this_1);
        return _this_1;
    }
    Collapsible.prototype.$rowEditIcon = function (modalId) {
        var $icon = $('<span class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
        ;
        $icon.attr('data-target', modalId);
        return $icon;
    };
    Collapsible.prototype.$rowCopyIcon = function () {
        return $('<span class="collapsibleItemCopy"><i class="material-icons">content_copy</i></span>');
    };
    Collapsible.prototype.$rowDeleteIcon = function () {
        return $('<span class="collapsibleItemDelete"><i class="material-icons">delete</i></span>');
    };
    /*
     * @param {CollapsibleItems[]} items - generowane m. in. SompleCollapsible
     * @param {type} parentViewObject
     * @param {type} parentViewObjectSelectHandler
     * @returns {undefined}
     */
    Collapsible.prototype.initialise = function (items, filterElements) {
        this.items = items;
        this.isSelectable = true;
        this.actionsMenuInitialise(filterElements);
        this.buildDom();
        Tools.hasFunction(this.makeItem);
        Tools.hasFunction(this.makeBody);
    };
    Collapsible.prototype.reloadRows = function () {
        this.items = this.makeCollapsibleItemsList();
        this.buildRows();
    };
    Collapsible.prototype.reloadRepositories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        query = this.connectedRepositoryGetRoute + this.filter.makeRequestParams();
                        console.log(query);
                        promises.push(this.connectedRepository.initialiseNodeJS(query));
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Collapsible.prototype.reload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var $preloader;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        $preloader = this.makePreloader(this.filter.id + 'preloader');
                        this.$collapsible.empty();
                        this.$actionsMenu.append($preloader);
                        return [4 /*yield*/, this.reloadRepositories()];
                    case 1:
                        _a.sent();
                        this.reloadRows();
                        $preloader.remove();
                        return [2 /*return*/];
                }
            });
        });
    };
    Collapsible.prototype.makeCollapsibleItemsList = function () {
        var itemsList = [];
        var i = 0;
        for (var _i = 0, _a = this.connectedRepository.items; _i < _a.length; _i++) {
            var item = _a[_i];
            itemsList.push(this.makeItem(item));
        }
        return itemsList;
    };
    Collapsible.prototype.makeItem = function (dataItem) {
        var body = this.makeBody(dataItem);
        return {
            id: dataItem.id,
            name: dataItem.name,
            body: body,
            dataItem: dataItem,
            editModal: this.editModal,
            subitemsCount: (body.collection) ? body.collection.items.length : undefined
        };
    };
    Collapsible.prototype.buildDom = function () {
        this.$dom.append(this.$actionsMenu);
        this.buildRows();
        this.$dom.append(this.$collapsible);
        if (this.title)
            this.$dom.prepend(this.$title);
    };
    Collapsible.prototype.buildRows = function () {
        this.$collapsible.empty();
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var row = this.buildRow(item);
            this.$collapsible
                .append(row.$dom);
        }
        this.$collapsible.collapsible(); //inicjacja wg instrukcji materialisecss
        if (this.isEditable)
            this.setEditAction();
        if (this.isDeletable)
            this.setDeleteAction();
        if (this.isSelectable)
            this.setSelectAction();
        if (this.isCopyable)
            this.setCopyAction();
    };
    /*
     * Tworzy element listy
     * @param {type} item - to gotowy item dla Collapsible (na podstawie surowych danych w repozytorium)
     * @returns {Collapsible.buildRow.row}
     */
    Collapsible.prototype.buildRow = function (item) {
        //każdy wiersz może mieć inny modal, domyślnie jest standardowy this.editModal
        if (this.isEditable) {
            if (!item.editModal && this.editModal)
                item.editModal = this.editModal;
        }
        var row = {
            $dom: $('<li>'),
            $crudButtons: $('<span class="crudButtons right">'),
            dataItem: item.dataItem,
            editModal: item.editModal
        };
        row.$crudButtons
            .css('visibility', 'hidden');
        if (item.attributes)
            for (var _i = 0, _a = item.attributes; _i < _a.length; _i++) {
                var attribute = _a[_i];
                row.$dom.attr(attribute.name, attribute.value);
            }
        row.$dom
            .append('<div class="collapsible-header"><i class="material-icons">filter_list</i>' + item.name)
            .append('<div class="collapsible-body">')
            .attr('itemId', item.id)
            .addClass('collapsible-item');
        //obsłuż status - potrzebne np. przy filtrowaniu
        for (var _b = 0, _c = this.filter.filterElements; _b < _c.length; _b++) {
            var element = _c[_b];
            if (element.inputType == 'FilterSwitchInput')
                row.$dom.attr(element.attributeToCheck, item.dataItem[element.attributeToCheck]);
        }
        if (!this.filter.checkIfRowMatchesFilters(row.$dom))
            row.$dom.hide();
        if (item.subitemsCount)
            row.$dom.children('.collapsible-header').append(new Badge(item.id, item.subitemsCount, 'teal lighten-2').$dom);
        row.$dom.children('.collapsible-header')
            .css('display', 'block')
            .append(row.$crudButtons);
        //if (!item.body)
        //    item.body = this.makeBody(item.dataItem);
        row.$dom.children(':last').append(item.body.$dom);
        this.addRowCrudButtons(row);
        return row;
    };
    /*
     * Ustawia pryciski edycji wierszy
     */
    Collapsible.prototype.addRowCrudButtons = function (row) {
        if (row.dataItem._gdFolderUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_ICON', row.dataItem._gdFolderUrl).$dom);
        if (row.dataItem._documentOpenUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_DOCUMENT_ICON', row.dataItem._documentOpenUrl).$dom);
        if (row.dataItem._documentEditUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_DOCUMENT_ICON', row.dataItem._documentEditUrl).$dom);
        if (this.isDeletable || this.isEditable) {
            row.$crudButtons
                .append(this.$rowEditIcon(row.editModal.id));
            if (this.isDeletable)
                row.$crudButtons
                    .append(this.$rowDeleteIcon());
        }
        if (this.isCopyable)
            row.$crudButtons.append(this.$rowCopyIcon());
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {dataItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    Collapsible.prototype.addNewHandler = function (status, dataItem, errorMessage) {
        switch (status) {
            case "DONE":
                this.$collapsible.children('[itemid=' + dataItem._tmpId + ']').remove();
                var newCollapsibleItem = this.makeItem(dataItem);
                this.$collapsible.prepend(this.buildRow(newCollapsibleItem).$dom);
                //this.$collapsible.children('[itemid=' + item.tmpId +']').attr('itemid',item.id);
                if (this.isEditable)
                    this.setEditAction();
                if (this.isDeletable)
                    this.setDeleteAction();
                if (this.isCopyable)
                    this.setCopyAction();
                if (this.isSelectable)
                    this.setSelectAction();
                this.items.push(newCollapsibleItem);
                return status;
                break;
            case "PENDING":
                if (this.items.length == 0) {
                    this.$dom.find('.emptyList').remove();
                }
                dataItem.id = dataItem._tmpId;
                this.$collapsible.prepend(this.buildRow(this.makeItem(dataItem)).$dom);
                this.$collapsible.find('[itemid=' + dataItem.id + ']').append(this.makePreloader('preloader' + dataItem.id));
                return dataItem.id;
                break;
            case "ERROR":
                alert(errorMessage);
                console.error(errorMessage);
                this.$collapsible.find('[itemid=' + dataItem._tmpId + ']').remove();
                //$('#preloader'+item.id).remove();
                if (this.items.length == 0) {
                    this.$dom.prepend(this.$emptyList);
                }
                return status;
                break;
        }
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {dataItem} item surowe dane, które trzeba przetworzyć przez this.makeItem()
     * @param {String} errorMessage
     * @returns {Promise}
     */
    Collapsible.prototype.editHandler = function (status, dataItem, errorMessage) {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            switch (status) {
                case "DONE":
                    $('#preloader' + dataItem.id).remove();
                    _this_1.items = _this_1.items.filter(function (searchItem) { return searchItem.id !== dataItem.id; });
                    var newItem = _this_1.makeItem(dataItem, _this_1.makeBody(dataItem));
                    var $newRow = _this_1.buildRow(newItem).$dom;
                    _this_1.items.push(newItem);
                    var $oldRow = _this_1.$collapsible.find('[itemid^=' + dataItem.id + ']');
                    $oldRow.last().after($newRow);
                    $oldRow.remove();
                    _this_1.setEditAction();
                    if (_this_1.isCopyable)
                        _this_1.setCopyAction();
                    if (_this_1.isDeletable)
                        _this_1.setDeleteAction();
                    if (_this_1.isSelectable)
                        _this_1.setSelectAction();
                    break;
                case "PENDING":
                    var $oldRow = _this_1.$collapsible.find('[itemid=' + dataItem.id + ']');
                    $oldRow.attr('itemid', dataItem.id + '_toDelete');
                    var $newRow = _this_1.buildRow(_this_1.makeItem(dataItem, _this_1.makeBody(dataItem))).$dom;
                    $newRow.append(_this_1.makePreloader('preloader' + dataItem.id));
                    $oldRow.after($newRow);
                    $oldRow.hide(1000);
                    break;
                case "ERROR":
                    alert(errorMessage);
                    _this_1.$collapsible.find('[itemid=' + dataItem.id + ']').remove();
                    var $oldRow = _this_1.$collapsible.find('[itemid=' + dataItem.id + '_toDelete]');
                    $oldRow.show(1000);
                    $oldRow.attr('itemid', dataItem.id);
                    if (_this_1.items.length == 0) {
                        _this_1.$dom.prepend(_this_1.$emptyList);
                    }
                    break;
            }
            resolve(status);
        });
    };
    /*
     * Krok 3 - funkcja wywoływana w rolesRepository.unasoosciatePersonRole potrzebny trik z appply dla callbacka
     */
    Collapsible.prototype.removeHandler = function (status, itemId, errorMessage, serveResponse) {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            switch (status) {
                case "DONE":
                    _this_1.$dom.find('[itemid=' + itemId + ']').remove();
                    _this_1.items = _this_1.items.filter(function (item) { return item.id !== itemId; });
                    if (_this_1.items.length == 0) {
                        _this_1.$dom.prepend(_this_1.$emptyList);
                    }
                    if (serveResponse) {
                        if (serveResponse.message)
                            alert(serveResponse.message);
                        if (serveResponse.externalUrl)
                            window.open(serveResponse.externalUrl, '_blank');
                    }
                    break;
                case "PENDING":
                    _this_1.$dom.find('[itemid=' + itemId + ']').append('<span class="new badge red" data-badge-caption="">kasuję...</span>');
                    break;
                case "ERROR":
                    alert(errorMessage);
                    _this_1.$dom.find('.new.badge.red').remove();
                    break;
            }
            resolve(status);
        });
    };
    Collapsible.prototype.hasArchivedElements = function () {
        return this.items.filter(function (item) { return item.dataItem.status && item.dataItem.status.match(/Zamknięt|Archiw/i); }).length > 0;
    };
    Collapsible.prototype.filterInitialise = function (filterElements) {
        this.filter.initialise(filterElements);
        if (this.items.length >= this.minimumItemsToFilter || this.hasArchivedElements()) {
            this.$actionsMenu.append(this.filter.$dom);
        }
    };
    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę addNewHandler()
     * TODO: do usunięcia
     */
    Collapsible.prototype.actionsMenuInitialise = function (filterElements) {
        //var $buttonsPanel = $('<div class="row">');
        //this.$actionsMenu.append($buttonsPanel);
        //if (this.addNewModal !== undefined)
        //    this.addNewModal.preppendTriggerButtonTo($buttonsPanel,"Dodaj wpis", this);
        if (this.isAddable) {
            this.$actionsMenu.prepend(this.addNewModal.createTriggerIcon());
            this.setAddNewAction();
        }
        if (this.hasFilter)
            this.filterInitialise(filterElements);
    };
    Collapsible.prototype.setSelectAction = function () {
        var _this = this;
        this.$collapsible.find(".collapsible-header").click(function () {
            var selectedItemId = $(this).parent().attr("itemId");
            if (_this.isMultiSelectable)
                _this.multiSelectAction(selectedItemId);
            else
                _this.defaultSelectAction(selectedItemId);
            _this.selectTrigger(selectedItemId);
            $('.collapsible').find('.collapsible-header > .crudButtons')
                .css('visibility', 'hidden');
            $(this).children('.crudButtons')
                .css('visibility', 'visible');
            $(this).closest('.collapsible').children('.collapsible-item').removeClass('selected');
            $(this).parent().addClass('selected');
        });
    };
    Collapsible.prototype.defaultSelectAction = function (selectedItemId) {
        this.currentItems[0] = this.items.filter(function (item) { return item.id == selectedItemId; })[0];
    };
    Collapsible.prototype.multiSelectAction = function (selectedItemId) {
        var wasItemAlreadySelected = this.currentItems.filter(function (item) { return item.id == selectedItemId; })[0];
        var selectedItem = this.items.filter(function (item) { return item.id == selectedItemId; })[0];
        if (wasItemAlreadySelected) {
            var index = Tools.arrGetIndexOf(this.currentItems, 'id', selectedItem);
            this.currentItems.splice(index, 1);
        }
        else
            this.currentItems.push();
    };
    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę removeTrigger()
     */
    Collapsible.prototype.setDeleteAction = function () {
        this.$dom.find(".collapsibleItemDelete").off('click');
        var _this = this;
        this.$collapsible.find(".collapsibleItemDelete").click(function () {
            if (confirm("Czy na pewno chcesz usunąć ten element?")) {
                _this.connectedRepository.deleteItem(_this.connectedRepository.currentItem, _this);
                if (_this.currentItems[0].body.collection)
                    for (var _i = 0, _a = _this.currentItems[0].body.collection.items; _i < _a.length; _i++) {
                        var collectIonItem = _a[_i];
                        _this.currentItems[0].body.collection.connectedRepository.clientSideDeleteItemHandler(collectIonItem);
                    }
                //_this.removeTrigger(_this.connectedRepository.currentItem.id);
            }
        });
    };
    Collapsible.prototype.setCopyAction = function () {
        this.$dom.find(".collapsibleItemCopy").off('click');
        var _this = this;
        this.$collapsible.find(".collapsibleItemCopy").click(function () {
            if (confirm("Chcesz skopiować ten element?")) {
                var originalItemId = _this.connectedRepository.currentItem.id;
                console.log('Id Oryginału: %s', originalItemId);
                _this.connectedRepository.copyCurrentItem(_this)
                    .then(function (copiedDataItem) {
                    console.log('Id Kopii: %s', copiedDataItem.id);
                    _this.defaultSelectAction(copiedDataItem.id);
                    if (_this.copyHandler)
                        _this.copyHandler(originalItemId, copiedDataItem.id);
                });
            }
        });
    };
    Collapsible.prototype.setAddNewAction = function () {
        var _this_1 = this;
        this.$actionsMenu.find(".addNewItemIcon").off('click');
        this.$actionsMenu.find(".addNewItemIcon").click(function () { return _this_1.addNewModal.triggerAction(_this_1); });
    };
    Collapsible.prototype.setEditAction = function () {
        this.$collapsible.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$collapsible.find(".collapsibleItemEdit").click(function () {
            $(this).closest('.collapsible-header').trigger('click');
            _this.currentItems[0].editModal.triggerAction(_this);
            Materialize.updateTextFields();
        });
    };
    return Collapsible;
}(Resultset));
