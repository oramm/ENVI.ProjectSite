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
var MilestoneTemplatesCollection = /** @class */ (function (_super) {
    __extends(MilestoneTemplatesCollection, _super);
    function MilestoneTemplatesCollection(initParamObject) {
        var _this = _super.call(this, { id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            isSelectable: true,
            connectedRepository: ContractTypesSetup.milestoneTemplatesRepository
        }) || this;
        _this.initialise(_this.makeList());
        _this.setAddableMode();
        return _this;
    }
    MilestoneTemplatesCollection.prototype.setAddableMode = function () {
        var _this = this;
        var isLimitReached = this.parentDataItem.isUniquePerContract &&
            ContractTypesSetup.milestoneTemplatesRepository.items.filter(function (item) { return item._milestoneType.id == _this.parentDataItem.id; }).length > 0;
        this.isAddable = !isLimitReached;
        this.refreshAddableMode();
    };
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    MilestoneTemplatesCollection.prototype.makeItem = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return { id: dataItem.id,
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
    MilestoneTemplatesCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._milestoneType.name + ' | ' + dataItem.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    MilestoneTemplatesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        (dataItem.status) ? true : dataItem.status = "";
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        $collectionElementDescription
            .append('<span>' + dataItem.startDateRule + ' - ' + dataItem.endDateRule + '<BR></span>');
        return $collectionElementDescription;
    };
    MilestoneTemplatesCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) {
            return item.dataItem._milestoneType.id == _this.parentDataItem.id;
        });
    };
    MilestoneTemplatesCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
    };
    return MilestoneTemplatesCollection;
}(SimpleCollection));
