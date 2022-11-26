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
var MilestoneTypesCollapsible = /** @class */ (function (_super) {
    __extends(MilestoneTypesCollapsible, _super);
    function MilestoneTypesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: false,
            connectedRepository: ContractTypesSetup.milestoneTypesRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new MilestoneTypeModal(id + '_newMilestoneType', 'Dodaj typ kamienia', _this, 'ADD_NEW');
        _this.editModal = new MilestoneTypeModal(id + '_editMilestoneType', 'Edytuj typ kamienia', _this, 'EDIT');
        _this.addNewMilestoneTemplateModal = new MilestoneTemplateModal(_this.id + '_newMilestoneTemplate', 'Dodaj szablon kamienia milowego', _this, 'ADD_NEW');
        _this.editMilestoneTemplateModal = new MilestoneTemplateModal(_this.id + '_editMilestoneTemplate', 'Edytuj szablon kamienia milowego', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    MilestoneTypesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var isUniqueLabel = (dataItem.isUniquePerContract) ? '[Unikalny]' : '[*]';
        item.name = dataItem.name + " " + isUniqueLabel;
        return item;
    };
    MilestoneTypesCollapsible.prototype.makeBody = function (dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        var subCollection = new MilestoneTemplatesCollection({
            id: 'milestoneTemplatesCollection_' + dataItem.id,
            title: "",
            addNewModal: this.addNewMilestoneTemplateModal,
            editModal: this.editMilestoneTemplateModal,
            parentDataItem: dataItem
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid', dataItem.id)
            .append($descriptionLabel)
            .append('Szablony kamieni domyślnych')
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    /*
     *
     */
    MilestoneTypesCollapsible.prototype.selectTrigger = function (itemId) {
        var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        if (itemId !== undefined &&
            this.connectedRepository.currentItem.id != itemId ||
            !isDashboardLoaded) {
            _super.prototype.selectTrigger.call(this, itemId);
            $('#milestoneTypeDashboard').attr('src', 'CaseTypes/CaseTypesList.html?parentItemId=' + this.connectedRepository.currentItem.id);
            $('#taskTemplatesDashboard').attr('src', 'about:blank');
        }
    };
    return MilestoneTypesCollapsible;
}(SimpleCollapsible));
