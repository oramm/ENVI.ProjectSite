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
var CaseTemplatesCollection = /** @class */ (function (_super) {
    __extends(CaseTemplatesCollection, _super);
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    function CaseTemplatesCollection(initParamObject) {
        var _this = _super.call(this, { id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: initParamObject.isAddable,
            isDeletable: true,
            connectedRepository: CaseTypesSetup.caseTemplatesRepository
        }) || this;
        _this.status = initParamObject.status;
        _this.initialise(_this.makeList());
        _this.setAddableMode();
        return _this;
    }
    CaseTemplatesCollection.prototype.setAddableMode = function () {
        var _this = this;
        var isLimitReached = this.parentDataItem.isUniquePerMilestone &&
            CaseTypesSetup.caseTemplatesRepository.items.filter(function (item) { return item._caseType.id == _this.parentDataItem.id; }).length > 0;
        this.isAddable = !isLimitReached;
        this.refreshAddableMode();
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    CaseTemplatesCollection.prototype.makeItem = function (dataItem) {
        return { id: dataItem.id,
            icon: undefined,
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            dataItem: dataItem
        };
    };
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    CaseTemplatesCollection.prototype.makeTitle = function (dataItem) {
        var isUnique = (dataItem._caseType.isUniquePerMilestone) ? 'Unikalna w kamieniu' : '';
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._caseType.name + ' | ' + dataItem.name + ' ' + isUnique, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    CaseTemplatesCollection.prototype.makeDescription = function (dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpEditDescription_TextField', 'Edytuj', undefined, true, 150), 'description', this);
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom);
        return $collectionElementDescription;
    };
    CaseTemplatesCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) { return item.dataItem.caseTypeId == _this.parentDataItem.id; });
    };
    CaseTemplatesCollection.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        $('#taskTemplatesDashboard', window.parent.document).attr('src', 'CaseTypes/TaskTemplates/TaskTemplatesList.html?parentItemId=' + this.connectedRepository.currentItem.id);
    };
    return CaseTemplatesCollection;
}(SimpleCollection));
