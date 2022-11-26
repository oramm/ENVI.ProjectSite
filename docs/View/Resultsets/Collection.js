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
/*
 * http://materializecss.com/collections.html
 */
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    /*
     * @param {Object} initParamObject {
     *      @param {String} id
     *      @param {String} title
     *      @param {boolean} isPlain - czy lista ma być prosta czy z Avatarem
     *      @param {boolean} hasFilter - czy ma być filtr
     *      @param {boolean} isAddable - czy można dodować nowe elementy
     *      @param {boolean} isDeletable - czy można usuwać elementy
     *      [@param {boolean} addNewModal]
     *      [@param {boolean} EditModal]
     * }
     * @returns {Collection}
     */
    function Collection(initParamObject) {
        var _this_1 = _super.call(this, initParamObject) || this;
        _this_1.isPlain = initParamObject.isPlain;
        _this_1.hasArchiveSwitch = false; //initParamObject.hasArchiveSwitch;
        _this_1.$addNewTriggerIcon;
        _this_1.title = initParamObject.title;
        _this_1.$emptyList = $('<div class="emptyList">Lista jest pusta</div>');
        //buduję szkielet, żeby podpiąć modale do $dom, 
        //na założeniu, że dom powstaje w konstruktorze bazuje Modal.buildDom()
        _this_1.$dom = $('<div>')
            .attr('id', 'container' + '_' + _this_1.id)
            .addClass('collection-container');
        _this_1.$title = $('<div class="resultset-title">');
        _this_1.$title.text(_this_1.title);
        _this_1.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + _this_1.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');
        _this_1.filter = new Filter(_this_1);
        return _this_1;
    }
    /*
     *
     * @param {connectedRepository.items} items
     * @param {type} parentViewObject - nie używane
     * @param {function} parentViewObjectSelectHandler - nie używane
     */
    Collection.prototype.initialise = function (items, filterElements) {
        if (filterElements === void 0) { filterElements = []; }
        this.items = items;
        this.buildDom();
        if (this.items.length === 0) {
            this.$dom;
            //.append(this.$emptyList);    
        }
        this.actionsMenuInitialise(filterElements);
        if (this.isAddable)
            Tools.hasFunction(this.addNewHandler);
        Tools.hasFunction(this.makeItem);
    };
    Collection.prototype.buildDom = function () {
        this.$collection = $('<ul class="collection">');
        if (this.title)
            this.$dom.prepend(this.$title);
        this.$dom
            .append(this.$actionsMenu)
            .append(this.$collection);
        this.buildCollectionDom();
    };
    Collection.prototype.buildCollectionDom = function () {
        for (var i = 0; i < this.items.length; i++) {
            var $row = (this.isPlain) ? this.buildPlainRow(this.items[i]).$dom : this.buildRow(this.items[i]);
            this.$collection.append($row);
        }
        if (this.isEditable)
            this.setEditAction();
        if (this.isDeletable)
            this.setDeleteAction();
        if (this.isSelectable)
            this.setSelectAction();
    };
    Collection.prototype.showRow = function (id) {
        this.$dom.find('.collection-item#' + id).show();
    };
    Collection.prototype.hideRow = function (id) {
        this.$dom.find('.collection-item#' + id).hide();
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollectionItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    Collection.prototype.addNewHandler = function (status, item, errorMessage) {
        //return new Promise((resolve, reject) => {
        switch (status) {
            case "DONE":
                this.$dom.find('#' + item._tmpId).remove();
                var $newRow = (this.isPlain) ? this.buildPlainRow(item).$dom : this.buildRow(item);
                this.$collection.prepend($newRow);
                if (this.editModal)
                    this.setEditAction();
                if (this.isDeletable)
                    this.setDeleteAction();
                if (this.isSelectable)
                    this.setSelectAction();
                this.items.push(item);
                //czasami ilość pozycji na liście jest limotowana i trzeba wyłaczyć dodawanie kolejnych
                if (typeof this.setAddableMode === 'function')
                    this.setAddableMode();
                return status;
                break;
            case "PENDING":
                if (this.items.length == 0) {
                    this.$dom.find('.emptyList').remove();
                }
                item.id = item._tmpId;
                var $newRow = (this.isPlain) ? this.buildPlainRow(item).$dom : this.buildRow(item);
                this.$collection.prepend($newRow);
                this.$dom.find('#' + item.id).append(this.makePreloader('preloader' + item.id));
                if (typeof this.setAddableMode === 'function')
                    this.setAddableMode();
                //return item.id;
                break;
            case "ERROR":
                alert(errorMessage);
                this.$dom.find('#' + item._tmpId).remove();
                //$('#preloader'+item.id).remove();
                if (this.items.length == 0) {
                    this.$dom.prepend(this.$emptyList);
                }
                return status;
                break;
        }
        //});
    };
    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollectionItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    Collection.prototype.editHandler = function (status, item, errorMessage) {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            switch (status) {
                case "DONE":
                    _this_1.items = _this_1.items.filter(function (searchItem) { return searchItem.id !== item.id; });
                    _this_1.items.push(item);
                    var $oldRow = _this_1.$collection.find('#' + item.id);
                    var $newRow = (_this_1.isPlain) ? _this_1.buildPlainRow(item).$dom : _this_1.buildRow(item);
                    $oldRow.after($newRow);
                    $oldRow.remove();
                    if (_this_1.isDeletable)
                        _this_1.setDeleteAction();
                    if (_this_1.isSelectable)
                        _this_1.setSelectAction();
                    if (_this_1.isEditable)
                        _this_1.setEditAction();
                    break;
                case "PENDING":
                    var $oldRow = _this_1.$collection.find('#' + item.id);
                    $oldRow.attr('id', item.id + '_toDelete');
                    var $newRow = (_this_1.isPlain) ? _this_1.buildPlainRow(item).$dom : _this_1.buildRow(item);
                    $newRow.append(_this_1.makePreloader('preloader' + item.id));
                    $oldRow.after($newRow);
                    $oldRow.hide(1000);
                    break;
                case "ERROR":
                    alert(errorMessage);
                    _this_1.$dom.find('#' + item.id).remove();
                    var $oldRow = _this_1.$collection.find('#' + item.id + '_toDelete');
                    $oldRow.show(1000);
                    $oldRow.attr('id', item.id);
                    if (_this_1.items.length == 0) {
                        //this.$dom.prepend(this.$emptyList);
                    }
                    break;
            }
            resolve(status);
        });
    };
    /*
     * Krok 3 - funkcja wywoływana w rolesRepository.unasoosciatePersonRole potrzebny trik z appply dla callbacka
     */
    Collection.prototype.removeHandler = function (status, itemId, errorMessage) {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            switch (status) {
                case "DONE":
                    _this_1.$dom.find('#' + itemId).remove();
                    _this_1.items = _this_1.items.filter(function (item) { return item.id !== itemId; });
                    if (_this_1.items.length == 0) {
                        _this_1.$actionsMenu.after(_this_1.$emptyList);
                    }
                    if (typeof _this_1.setAddableMode === 'function')
                        _this_1.setAddableMode();
                    break;
                case "PENDING":
                    var $deleteBadge = $('<span>');
                    $deleteBadge
                        .attr('id', 'deleteBadge_' + _this_1.id + '_' + itemId)
                        .attr('data-badge-caption', '')
                        .addClass('new badge red')
                        .html('kasuję...');
                    _this_1.$dom.find('#' + itemId).append($deleteBadge);
                    if (typeof _this_1.setAddableMode === 'function')
                        _this_1.setAddableMode();
                    break;
                case "ERROR":
                    alert(errorMessage);
                    $('#deleteBadge_' + _this_1.id + '_' + itemId).remove();
                    break;
            }
            resolve(status);
        });
    };
    Collection.prototype.setSelectAction = function () {
        this.$dom.find("li").off('click');
        this.$dom.find("li").off('mousedown');
        var _this = this;
        //wyłącz klasę active
        this.$dom.find("li").mousedown(function () {
            //jeżeli collection nalezy do collapsible trzeba wyczyścić pozostałe kolekcie w innych pozycjach collapsible
            if ($(this).closest('.collapsible-item').length > 0) {
                $(this).closest('.collapsible').find('.collection-item.active').removeClass('active');
                $(this).closest('.collapsible').find('.collection-item > .crudButtons').css('display', 'none');
            }
            //jeżeli collection jest bez collapsible zajmuje się tylko sama sobą
            else {
                $(this).closest('.collection').children('.active').removeClass('active');
                $(this).closest('.collection').find('.collection-item > .crudButtons').css('display', 'none');
            }
            $(this)
                .addClass('active')
                .children('.crudButtons')
                .css('display', 'initial');
            //_this.parentViewObjectSelectHandler.apply(_this.parentViewObject,[$(this).attr("id")]);
            _this.selectTrigger($(this).attr("id"));
        });
    };
    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę removeTrigger()
     */
    Collection.prototype.setDeleteAction = function () {
        this.$dom.find(".itemDelete").off('click');
        var _this = this;
        this.$dom.find(".itemDelete").click(function () {
            if (confirm("Czy na pewno chcesz usunąć ten element?"))
                _this.removeTrigger($(this).closest('.collection-item').attr("id"));
        });
    };
    Collection.prototype.setCopyAction = function () {
        this.$dom.find(".itemCopy").off('click');
        var _this = this;
        this.$collapsible.find(".itemCopy").click(function () {
            var originalItemId = connectedRepository.copyCurrentItem.id;
            _this.connectedRepository.copyCurrentItem(_this)
                .then(function (copiedDataItem) { if (_this.copyHandler)
                _this.copyHandler(originalItemId); });
        });
    };
    Collection.prototype.setAddNewAction = function () {
        var _this_1 = this;
        this.$dom.find(".addNewItemIcon").click(function () { return _this_1.addNewModal.triggerAction(_this_1); });
    };
    Collection.prototype.setEditAction = function () {
        //this.$dom.find(".collectionItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collectionItemEdit").click(function (e) {
            $(this).parent().parent().parent().parent().trigger('click');
            _this.editModal.triggerAction(_this);
            //e.stopPropagation();
            //e.preventDefault();
        });
    };
    //-------------------------------------- funkcje prywatne -----------------------------------------------------
    /*
     * Tworzy element listy
     * @param {type} item - to gotowy item dla Collapsible (na podstawie surowych danych w repozytorium)
     * @returns {Collection.buildRow.$row}
     */
    Collection.prototype.buildRow = function (item) {
        var $row = $('<li class="collection-item avatar" id="' + item.id + '">');
        var $titleContainer = $('<span class="title">'), $descriptionContainer = $('<p>');
        if (item.$title instanceof jQuery)
            $titleContainer.
                append(item.$title);
        else if (typeof item.title === 'string')
            $titleContainer
                .html(item.title);
        if (item.$description instanceof jQuery)
            $descriptionContainer.
                append(item.$description);
        else if (typeof item.description === 'string')
            $descriptionContainer
                .html(item.description);
        $row
            .append('<i class="material-icons circle">' + item.icon + '</i>')
            .append($titleContainer)
            .append($descriptionContainer)
            .append('<div class="secondary-content fixed-action-btn horizontal"></div>');
        this.addRowCrudButtons($row, item);
        return $row;
    };
    /*
     * TODO: bezpieczniej jest używać parametru 'itemId zamiast ID w css bo nr id mogąsię powtarzać przy kilku kolecjach na jednej stronie
     *       to jest już zaimplenentowane w Collapsible
     * @param {type} item - to gotowy item dla Collapsible (na podstawie surowych danych w repozytorium)
     * @returns {Collection.buildPlainRow.row.$dom|row.$dom}
     */
    Collection.prototype.buildPlainRow = function (item) {
        var row = {
            $dom: $('<li class="collection-item" id="' + item.id + '">'),
            $crudButtons: $('<span class="crudButtons">'),
            dataItem: item.dataItem
        };
        row.$crudButtons
            .css('display', 'none');
        var $titleContainer = $('<span class="title">'), $descriptionContainer = $('<p>');
        $titleContainer.
            append(item.$title);
        $descriptionContainer.
            append(item.$description);
        row.$dom
            .append($titleContainer)
            .append($descriptionContainer)
            .append(row.$crudButtons);
        this.addPlainRowCrudButtons(row);
        //do uspójnienia z Collapsible - tam zwracany jest obiekt typu row
        return row;
    };
    /*
     * Ustawia pryciski edycji wierszy
     */
    Collection.prototype.addPlainRowCrudButtons = function (row) {
        if (this.isEditable)
            row.$crudButtons.append(this.editModal.createTriggerIcon());
        if (row.dataItem._gdFolderUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_ICON', row.dataItem._gdFolderUrl).$dom);
        if (row.dataItem._documentOpenUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_DOCUMENT_ICON', row.dataItem._documentOpenUrl).$dom);
        if (row.dataItem._documentEditUrl)
            row.$crudButtons.append(new ExternalResourcesIconLink('GD_DOCUMENT_ICON', row.dataItem._documentEditUrl).$dom);
        if (this.isDeletable)
            row.$crudButtons.append('<span class="itemDelete"><i class="material-icons">delete</i></span>');
    };
    Collection.prototype.addRowCrudButtons = function ($row, item) {
        if (this.isDeletable || this.isEditable) {
            var button = $row.find('.secondary-content:last-child');
            button
                .append('<a class="btn-floating"><i class="material-icons">menu</i></a>')
                .append('<ul>');
            if (this.editModal)
                button.children('ul')
                    .append('<li><a data-target="' + this.editModal.id + '" class="btn-floating blue collectionItemEdit modal-trigger"><i class="material-icons">edit</i></a></li>');
            if (this.isCopyable)
                button.children('ul')
                    .append('<li><span class="itemCopy"><i class="material-icons">content_copy</i></span></li>');
            if (this.isDeletable)
                button.children('ul')
                    .append('<li><a class="btn-floating red itemDelete"><i class="material-icons">delete</i></a></li>');
        }
    };
    Collection.prototype.filterInitialise = function (filterElements) {
        if (this.items.length >= this.minimumItemsToFilter) {
            this.filter.initialise(filterElements);
            this.$actionsMenu.append(this.filter.$dom);
        }
    };
    Collection.prototype.actionsMenuInitialise = function (filterElements) {
        if (this.isAddable) {
            this.$addNewTriggerIcon = this.addNewModal.createTriggerIcon();
            this.$actionsMenu.prepend(this.$addNewTriggerIcon);
            this.setAddNewAction();
        }
        //this.addNewModal.preppendTriggerIconTo(this.$actionsMenu,this);
        if (this.hasFilter)
            this.filterInitialise(filterElements);
    };
    Collection.prototype.refreshAddableMode = function () {
        if (this.isAddable)
            this.$addNewTriggerIcon.show();
        else
            this.$addNewTriggerIcon.hide();
    };
    return Collection;
}(Resultset));
var CollectionItem = /** @class */ (function () {
    function CollectionItem(id, icon, title, description, editUrl) {
        this.id = id;
        this.icon = icon;
        this.title = title;
        this.description = description;
        this.editUrl = editUrl;
    }
    CollectionItem.prototype.initialise = function (paramObject) {
        this.id = paramObject.id;
        this.icon = paramObject.icon;
        this.title = paramObject.title;
        this.description = paramObject.description;
        this.editUrl = paramObject.editUrl;
    };
    return CollectionItem;
}());
;
