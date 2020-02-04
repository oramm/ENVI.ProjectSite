/* 
 * http://materializecss.com/collapsible.html
 */
class Collapsible {
    constructor(initParamObject) {
        this.id = initParamObject.id;
        this.parentId = initParamObject.parentId;
        this.hasFilter = (initParamObject.hasFilter === undefined) ? true : initParamObject.hasFilter;
        this.minimumItemsToFIlter = (initParamObject.minimumItemsToFIlter) ? initParamObject.minimumItemsToFIlter : 6;
        this.isAddable = (initParamObject.isAddable === undefined) ? true : initParamObject.isAddable;
        this.isDeletable = (initParamObject.isDeletable === undefined) ? true : initParamObject.isDeletable;
        this.isEditable = initParamObject.isEditable;
        this.isExpandable = (initParamObject.isExpandable === undefined) ? false : initParamObject.isExpandable;
        this.isMultiSelectable = initParamObject.isMultiSelectable;
        this.hasArchiveSwitch = initParamObject.hasArchiveSwitch;
        this.subitemsCount = initParamObject.subitemsCount;
        this.currentItems = []; //wybrany wiersz
        this.$dom;
        this.$collapsible;
        this.$actionsMenu;

        //buduję szkielet, żeby podpiąć modale do $dom, 
        //na założeniu, że dom powstaje w konstruktorze bazuje Modal.buildDom()
        this.$collapsible = $('<ul class="collapsible">');
        this.$collapsible.attr('id', this.id);
        this.$collapsible.attr('data-collapsible', (this.isExpandable) ? 'expandable' : 'accordion');
        this.$actionsMenu = $('<div>')
            .attr('id', 'actionsMenu' + '_' + this.id)
            .addClass('cyan lighten-5')
            .addClass('actionsMenu');

        this.$dom = $('<div>')
            .attr('id', 'container' + '_' + this.id)
            .append(this.$actionsMenu)
            .append(this.$collapsible);
        this.filter = new Filter(this);
    }

    $rowEditIcon(modalId) {
        //if (!modalId) modalId = this.editModal.id;
        var $icon = $('<span class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');;
        $icon.attr('data-target', modalId);
        return $icon;
    }
    $rowDeleteIcon() {
        return $('<span class="collapsibleItemDelete"><i class="material-icons">delete</i></span>');
    }
    /*
     * @param {CollapsibleItems[]} items - generowane m. in. SompleCollapsible
     * @param {type} parentViewObject
     * @param {type} parentViewObjectSelectHandler
     * @returns {undefined}
     */
    initialise(items, parentViewObject, parentViewObjectSelectHandler) {
        this.items = items;
        this.parentViewObject = parentViewObject;
        this.parentViewObjectSelectHandler = parentViewObjectSelectHandler;

        //this.isEditable = (this.editModal !== undefined)? true : false;
        this.isSelectable = true;

        this.buildDom();
        this.actionsMenuInitialise();

        Tools.hasFunction(this.makeItem);
        Tools.hasFunction(this.makeBodyDom);
    }

    buildDom() {
        for (var i = 0; i < this.items.length; i++) {
            var row = this.buildRow(this.items[i]);
            this.$collapsible
                .append(row.$dom);
        }
        this.$collapsible.collapsible();//inicjacja wg instrukcji materialisecss

        if (this.isEditable) this.setEditAction();
        if (this.isDeletable) this.setDeleteAction();
        if (this.isSelectable) this.setSelectAction();
    }
    /*
     * Tworzy element listy
     * @param {type} item - to gotowy item dla Collapsible (na podstawie surowych danych w repozytorium)
     * @returns {Collapsible.buildRow.row}
     */
    buildRow(item) {
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

        row.$dom
            .append('<div class="collapsible-header"><i class="material-icons">filter_list</i>' + item.name)
            .append('<div class="collapsible-body">')
            .attr('itemId', item.id)
            .addClass('collapsible-item');
        //obsłuż status - potrzebne np. przy filtrowaniu
        if (item.dataItem.status)
            row.$dom.attr('status', item.dataItem.status);
        if (!this.filter.checkIfRowMatchesFilters(row.$dom))
            row.$dom.hide();
        if (this.subitemsCount)
            row.$dom.children('.collapsible-header').append(new Badge(item.id, this.subitemsCount, 'light-blue').$dom);
        row.$dom.children('.collapsible-header')
            .css('display', 'block')
            .append(row.$crudButtons);

        row.$dom.children(':last').append((item.$body) ? item.$body : this.makeBodyDom(item.dataItem));
        this.addRowCrudButtons(row);
        return row;
    }

    /*
     * Ustawia pryciski edycji wierszy
     */
    addRowCrudButtons(row) {
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
    }

    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {CollapsibleItem} item
     * @param {String} errorMessage
     * @returns {Promise}
     */
    addNewHandler(status, item, errorMessage) {
        switch (status) {
            case "DONE":
                this.$collapsible.children('[itemid=' + item._tmpId + ']').remove();
                this.$collapsible.prepend(this.buildRow(this.makeItem(item)).$dom);
                //this.$collapsible.children('[itemid=' + item.tmpId +']').children('.progress').remove();
                //this.$collapsible.children('[itemid=' + item.tmpId +']').attr('itemid',item.id);
                if (this.isEditable) this.setEditAction();
                if (this.isDeletable) this.setDeleteAction();
                if (this.isSelectable) this.setSelectAction();
                this.items.push(this.makeItem(item));
                return status;
                break;
            case "PENDING":
                if (this.items.length == 0) {
                    this.$dom.find('.emptyList').remove();
                }
                item.id = item._tmpId;
                this.$collapsible.prepend(this.buildRow(this.makeItem(item)).$dom);
                this.$collapsible.find('[itemid=' + item.id + ']').append(this.makePreloader('preloader' + item.id))
                return item.id;
                break;
            case "ERROR":
                alert(errorMessage);
                this.$collapsible.find('[itemid=' + item._tmpId + ']').remove();
                //$('#preloader'+item.id).remove();
                if (this.items.length == 0) {
                    this.$dom.prepend(this.$emptyList);
                }
                return status;
                break;
        }
    }

    /*
     * funkcja wywoływana w repository, potrzebny trik z appply dla callbacka
     * @param {String} status
     * @param {dataItem} item surowe dane, które trzeba przetworzyć przez this.makeItem()
     * @param {String} errorMessage
     * @returns {Promise}
     */
    editHandler(status, item, errorMessage) {
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    $('#preloader' + item.id).remove();
                    this.items = this.items.filter(function (searchItem) { return searchItem.id !== item.id });
                    var newItem = this.makeItem(item, this.makeBodyDom(item).$dom);
                    var $newRow = this.buildRow(newItem).$dom;
                    this.items.push(newItem);

                    var $oldRow = this.$collapsible.find('[itemid^=' + item.id + ']');
                    $oldRow.last().after($newRow);
                    $oldRow.remove();
                    this.setEditAction();
                    if (this.isDeletable) this.setDeleteAction();
                    if (this.isSelectable) this.setSelectAction();
                    break;
                case "PENDING":
                    var $oldRow = this.$collapsible.find('[itemid=' + item.id + ']');
                    $oldRow.attr('itemid', item.id + '_toDelete');
                    var $newRow = this.buildRow(this.makeItem(item, this.makeBodyDom(item))).$dom;
                    $newRow.append(this.makePreloader('preloader' + item.id))
                    $oldRow.after($newRow);
                    $oldRow.hide(1000);

                    break;
                case "ERROR":
                    alert(errorMessage);
                    this.$collapsible.find('[itemid=' + item.id + ']').remove();
                    var $oldRow = this.$collapsible.find('[itemid=' + item.id + '_toDelete]');
                    $oldRow.show(1000);
                    $oldRow.attr('itemid', item.id);
                    if (this.items.length == 0) {
                        this.$dom.prepend(this.$emptyList);
                    }

                    break;
            }
            resolve(status)
        });
    }

    /*
     * Krok 3 - funkcja wywoływana w rolesRepository.unasoosciatePersonRole potrzebny trik z appply dla callbacka
     */
    removeHandler(status, itemId, errorMessage, serveResponse) {
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    this.$dom.find('[itemid=' + itemId + ']').remove();
                    this.items = this.items.filter(function (item) { return item.id !== itemId });
                    if (this.items.length == 0) {
                        this.$dom.prepend(this.$emptyList);
                    }
                    if (serveResponse) {
                        if (serveResponse.message)
                            alert(serveResponse.message);
                        if (serveResponse.externalUrl)
                            window.open(serveResponse.externalUrl, '_blank');

                    }
                    break;
                case "PENDING":
                    this.$dom.find('[itemid=' + itemId + ']').append('<span class="new badge red" data-badge-caption="">kasuję...</span>');
                    break;
                case "ERROR":
                    alert(errorMessage);
                    this.$dom.find('.new.badge.red').remove();
                    break;
            }
            resolve(status);
        });
    }
    hasArchivedElements() {
        return this.items.filter(item => item.dataItem.status && item.dataItem.status.match(/Zamknięt|Archiw/i)).length > 0
    }

    filterInitialise() {
        if (this.items.length >= this.minimumItemsToFIlter || this.hasArchivedElements()) {
            this.filter.initialise();
            this.$actionsMenu.append(this.filter.$dom);
        }
    }
    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę addNewHandler()
     * TODO: do usunięcia
     */
    actionsMenuInitialise() {
        //var $buttonsPanel = $('<div class="row">');
        //this.$actionsMenu.append($buttonsPanel);
        //if (this.addNewModal !== undefined)
        //    this.addNewModal.preppendTriggerButtonTo($buttonsPanel,"Dodaj wpis", this);

        if (this.isAddable) {
            this.$actionsMenu.prepend(this.addNewModal.createTriggerIcon());
            this.setAddNewAction();
        }

        if (this.hasFilter)
            this.filterInitialise();
    }

    setSelectAction() {
        var _this = this;
        this.$dom.find(".collapsible-header").click(function () {
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
        });
    }

    defaultSelectAction(selectedItemId) {
        this.currentItems[0] = this.items.filter(item => item.id == selectedItemId)[0];
        //_this.parentViewObjectSelectHandler.apply(_this.parentViewObject,[$(this).attr("id")]);
    }

    multiSelectAction(selectedItemId) {
        var wasItemAlreadySelected = this.currentItems.filter(item => item.id == selectedItemId)[0];
        var selectedItem = this.items.filter(item => item.id == selectedItemId)[0]
        if (wasItemAlreadySelected) {
            var index = Tools.arrGetIndexOf(this.currentItems, 'id', selectedItem);
            this.currentItems.splice(index, 1)
        }
        else
            this.currentItems.push();
        //_this.parentViewObjectSelectHandler.apply(_this.parentViewObject,[$(this).attr("id")]);
    }

    /*
     * Klasa pochodna musi mieć zadeklarowaną metodę removeTrigger()
     */
    setDeleteAction() {
        this.$dom.find(".collapsibleItemDelete").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemDelete").click(function () {
            if (confirm("Czy na pewno chcesz usunąć ten element?"))
                _this.removeTrigger($(this).parent().parent().parent().attr("itemId"));
        });
    }

    setAddNewAction() {
        this.$actionsMenu.find(".addNewItemIcon").click(
            () => this.addNewModal.triggerAction(this)
        );
    }

    setEditAction() {
        this.$dom.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemEdit").click(function () {
            $(this).closest('.collapsible-header').trigger('click');
            _this.currentItems[0].editModal.triggerAction(_this);
            Materialize.updateTextFields();
        });
    }

    makePreloader(id) {
        var $preloader = $('<div class="progress">');
        $preloader
            .attr('id', id)
            .append('<div class="indeterminate">');
        return $preloader;
    }
}