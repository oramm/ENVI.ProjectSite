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
var MilestoneTypeContractTypeAssociationsCollection = /** @class */ (function (_super) {
    __extends(MilestoneTypeContractTypeAssociationsCollection, _super);
    function MilestoneTypeContractTypeAssociationsCollection(initParamObject) {
        var _this = _super.call(this, {
            id: initParamObject.id,
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
            connectedRepository: ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository,
        }) || this;
        _this.initialise(_this.makeList());
        //podłącz do nadrzędnego collapsibla, żeby dostać się do dodatkowych modali
        _this.connectedResultsetComponent = initParamObject.connectedResultsetComponent;
        _this.connectedResultsetComponent.addNewMilestoneType.preppendTriggerButtonTo(_this.$actionsMenu, "Dodaj typ kamienia", _this);
        return _this;
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    MilestoneTypeContractTypeAssociationsCollection.prototype.makeItem = function (dataItem) {
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
    MilestoneTypeContractTypeAssociationsCollection.prototype.makeTitle = function (dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.folderNumber + "  " + dataItem._milestoneType.name, dataItem, new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150), 'name', this);
        return titleAtomicEditLabel.$dom;
    };
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    MilestoneTypeContractTypeAssociationsCollection.prototype.makeDescription = function (dataItem) {
        var $collectionElementDescription = $('<span>');
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        if (dataItem._milestoneType.isUniquePerContract)
            $collectionElementDescription.append(new Badge(dataItem.id + '_un', 'Unikalny', 'light-blue').$dom);
        if (dataItem.isDefault)
            $collectionElementDescription.append(new Badge(dataItem.id + '_def', 'Domyślny', 'lime darken-4').$dom);
        return $collectionElementDescription;
    };
    MilestoneTypeContractTypeAssociationsCollection.prototype.makeList = function () {
        var _this = this;
        return _super.prototype.makeList.call(this).filter(function (item) {
            return item.dataItem._contractType.id == _this.parentDataItem.id;
        });
    };
    MilestoneTypeContractTypeAssociationsCollection.prototype.selectTrigger = function (itemId) {
        //var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        //if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId ||
        //    isDashboardLoaded){
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#contractTypeDashboard').attr('src','CasesTemplates/CasesTemplatesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        //}
    };
    return MilestoneTypeContractTypeAssociationsCollection;
}(SimpleCollection));
