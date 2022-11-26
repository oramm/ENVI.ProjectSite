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
var CollapsibleSelectCollection = /** @class */ (function (_super) {
    __extends(CollapsibleSelectCollection, _super);
    function CollapsibleSelectCollection(initParamObject) {
        var _this_1 = _super.call(this, {
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            isPlain: true,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            isSelectable: true,
            connectedRepository: initParamObject.collectionRepository
        }) || this;
        _this_1.parentCollapsibleSelect = initParamObject.parentCollapsibleSelect;
        _this_1.initialise(_this_1.makeList());
        return _this_1;
    }
    /*
     * @dataItem connectedRepository.items[i]
     */
    CollapsibleSelectCollection.prototype.makeItem = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return {
            id: dataItem.id,
            //icon:   'info',
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            editUrl: dataItem.editUrl,
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    CollapsibleSelectCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(this.parentCollapsibleSelect.makeCollectionItemNameFunction(dataItem), dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    CollapsibleSelectCollection.prototype.makeDescription = function (dataItem) {
        var $collectionElementDescription = $('<span>');
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        return $collectionElementDescription;
    };
    CollapsibleSelectCollection.prototype.makeList = function () {
        var _this_1 = this;
        return _super.prototype.makeList.call(this).filter(function (item) {
            //console.log('this.parentDataItem.id: %s ==? %s', this.parentDataItem.id, item.dataItem._parent.id)
            return item.dataItem._parent.id == _this_1.parentDataItem.id;
        });
    };
    CollapsibleSelectCollection.prototype.selectTrigger = function (itemId) {
        if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId) {
            _super.prototype.selectTrigger.call(this, itemId);
            this.parentCollapsibleSelect.onItemChosen(this.connectedRepository.currentItems);
            this.hideRow(itemId);
        }
    };
    return CollapsibleSelectCollection;
}(SimpleCollection));
var CollapsibleSelect = /** @class */ (function () {
    function CollapsibleSelect(id, label, isRequired, parentForm) {
        this.id = id;
        this.label = label;
        this.isRequired = isRequired;
        this.parentForm = parentForm;
        this.value;
        this.lastSelectedItem;
        this.$dom;
        this.$label = $('<label>' + this.label + '</label>');
        this.showCollapsibleButton = new RaisedButton('Wybierz opcję', this.showCollapsible, this);
        this.hideCollapsibleButton = new RaisedButton('Nie wybieraj', this.hideCollapsible, this);
        this.buildDom();
        var _this = this;
        //obiekt tworzonony dopiero w this.initialise()
        this.Collapsible = /** @class */ (function (_super) {
            __extends(Collapsible, _super);
            function Collapsible(initParamObject) {
                var _this_1 = _super.call(this, {
                    id: _this.id + '_CollapsibleSelect_itemsListCollapsible_' + _this.id,
                    hasFilter: true,
                    isEditable: false,
                    isAddable: false,
                    isDeletable: false,
                    hasArchiveSwitch: false,
                    connectedRepository: _this.collapsibleRepository,
                    parentDataItem: initParamObject.parentDataItem,
                }) || this;
                _this_1.initialise(_this_1.makeCollapsibleItemsList());
                return _this_1;
            }
            /*
             * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
             * @param {type} connectedRepository.items[i]
             * @returns {Collapsible.Item}
             */
            Collapsible.prototype.makeItem = function (dataItem) {
                var item = _super.prototype.makeItem.call(this, dataItem);
                item.name = _this.makeCollapsibleItemNameFunction(dataItem);
                return item;
            };
            Collapsible.prototype.makeCollapsibleItemsList = function () {
                var _this_1 = this;
                return _super.prototype.makeCollapsibleItemsList.call(this).filter(function (item) { return item.dataItem[_this.parentObjectName]['id'] == _this_1.parentDataItem.id; });
            };
            Collapsible.prototype.makeBody = function (dataItem) {
                var subCollection = new CollapsibleSelectCollection({
                    id: _this.id + '_CollapsibleSelect_itemsListCollection_' + dataItem.id,
                    title: '',
                    parentDataItem: dataItem,
                    parentCollapsibleSelect: _this,
                    collectionRepository: _this.collectionRepository
                });
                var $panel = $('<div>')
                    .attr('id', 'collapsibleBody' + dataItem.id)
                    .append(subCollection.$dom);
                return {
                    collection: subCollection,
                    $dom: $panel
                };
            };
            return Collapsible;
        }(SimpleCollapsible));
    }
    CollapsibleSelect.prototype.buildDom = function () {
        this.$dom = $('<div>');
        this.$selectedOptionsPanel = $('<div>');
        this.showCollapsibleButton.setEnabled(false);
        this.hideCollapsibleButton.$dom.hide();
        this.$dom
            .append(this.$label)
            .append(this.$selectedOptionsPanel)
            .append(this.showCollapsibleButton.$dom)
            .append(this.hideCollapsibleButton.$dom);
    };
    /*
     * Obiekt musi być inicjowany jak zwykły SelectField - repozytorium wynika z kontektstu
     */
    CollapsibleSelect.prototype.initialise = function (parenDataItem, parentObjectName, collapsibleRepository, makeCollapsibleItemNameFunction, collectionRepository, makeCollectionItemNameFunction, itemChosenHandler, itemUnchosenHandler) {
        if (this.collapsible) {
            this.collapsible.$dom.remove();
            delete this.collapsible;
        }
        this.parentObjectName = parentObjectName;
        this.collapsibleRepository = collapsibleRepository;
        this.makeCollapsibleItemNameFunction = makeCollapsibleItemNameFunction;
        this.collectionRepository = collectionRepository;
        this.makeCollectionItemNameFunction = makeCollectionItemNameFunction;
        this.itemChosenHandler = itemChosenHandler;
        this.itemUnchosenHandler = itemUnchosenHandler;
        this.collapsible = new this.Collapsible({ parentDataItem: parenDataItem });
        this.$dom.append(this.collapsible.$dom);
        this.hideCollapsible();
    };
    CollapsibleSelect.prototype.onItemChosen = function () {
        this.value = this.connectedRepository.currentItem;
        this.lastSelectedItem = this.connectedRepository.currentItem;
        this.$dom.find('.chip').remove();
        this.hideCollapsible();
        this.addChip(this.lastSelectedItem);
        if (this.itemChosenHandler)
            this.itemChosenHandler();
    };
    CollapsibleSelect.prototype.showCollapsible = function () {
        this.showCollapsibleButton.$dom.hide();
        this.hideCollapsibleButton.$dom.show();
        this.collapsible.$dom.show();
    };
    CollapsibleSelect.prototype.hideCollapsible = function () {
        this.collapsible.$dom.hide();
        this.showCollapsibleButton.$dom.show();
        this.hideCollapsibleButton.$dom.hide();
    };
    CollapsibleSelect.prototype.addChip = function (dataItem) {
        this.$selectedOptionsPanel
            .append(new Chip('CollapsibleSelect_itemsListCollection_case_' + dataItem.id, this.makeCollectionItemNameFunction(this.lastSelectedItem), dataItem, this.onItemUnchosen, this).$dom);
    };
    CollapsibleSelect.prototype.clear = function () {
        this.$selectedOptionsPanel.children().remove();
        this.connectedRepository.currentItem = undefined;
        this.connectedRepository.currentItems = undefined;
        this.value = undefined;
    };
    CollapsibleSelect.prototype.initValue = function () {
    };
    CollapsibleSelect.prototype.validate = function () {
        if (this.isRequired) {
            return this.value !== this.defaultDisabledOption && this.value !== undefined;
        }
        else
            return true;
    };
    CollapsibleSelect.prototype.simulateChosenItem = function (inputvalue) {
        this.value = inputvalue;
        this.lastSelectedItem = inputvalue;
        if (!Tools.search(inputvalue.id, 'id', this.value))
            this.addChip(this.lastSelectedItem);
        this.hideCollapsible();
        if (this.itemChosenHandler)
            this.itemChosenHandler();
    };
    CollapsibleSelect.prototype.getValue = function () {
        return this.value;
    };
    return CollapsibleSelect;
}());
var CollapsibleMultiSelect = /** @class */ (function (_super) {
    __extends(CollapsibleMultiSelect, _super);
    function CollapsibleMultiSelect(id, label, isRequired, parentForm) {
        return _super.call(this, id, label, isRequired, parentForm) || this;
    }
    CollapsibleMultiSelect.prototype.onItemChosen = function () {
        this.value = Array.from(this.collectionRepository.currentItems);
        this.lastSelectedItem = this.collectionRepository.currentItem;
        this.hideCollapsible();
        this.addChip(this.lastSelectedItem);
        if (this.itemChosenHandler)
            this.itemChosenHandler();
    };
    CollapsibleMultiSelect.prototype.simulateChosenItem = function (inputvalue) {
        this.value = inputvalue;
        for (var _i = 0, inputvalue_1 = inputvalue; _i < inputvalue_1.length; _i++) {
            var item = inputvalue_1[_i];
            this.lastSelectedItem = item;
            if (!Tools.search(item.id, 'id', this.value))
                this.addChip(this.lastSelectedItem);
        }
        this.hideCollapsible();
        this.itemChosenHandler();
    };
    CollapsibleMultiSelect.prototype.onItemUnchosen = function (unchosenItem) {
        this.collectionRepository.deleteFromCurrentItems(unchosenItem);
        this.value = Array.from(this.collectionRepository.currentItems);
        if (this.itemUnchosenHandler)
            this.itemUnchosenHandler();
        this.$dom.find('.collection-item#' + unchosenItem.id).show();
    };
    return CollapsibleMultiSelect;
}(CollapsibleSelect));
