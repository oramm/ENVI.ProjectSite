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
var ProcessesCollapsible = /** @class */ (function (_super) {
    __extends(ProcessesCollapsible, _super);
    function ProcessesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: ProcessesSetup.processesRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new ProcessModal(id + '_newProcessModal', 'Dodaj proces', _this, 'ADD_NEW');
        _this.editModal = new ProcessModal(id + '_editProcessModal', 'Edytuj proces', _this, 'EDIT');
        _this.addNewStepModal = new StepModal(_this.id + '_newStepModal', 'Dodaj krok do procesu', _this, 'ADD_NEW');
        _this.editStepModal = new StepModal(_this.id + '_editStepModal', 'Edytuj krok w procesie', _this, 'EDIT');
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
    ProcessesCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        item.name = dataItem.name + ' >> typ sprawy: ' + dataItem._caseType.name;
        return item;
    };
    ProcessesCollapsible.prototype.makeBody = function (dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        var subCollection = new StepsCollection({
            id: 'stepssCollection_' + dataItem.id,
            title: "",
            addNewModal: this.addNewStepModal,
            editModal: this.editStepModal,
            parentDataItem: dataItem,
            connectedResultsetComponent: this
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid', dataItem.id)
            .append($descriptionLabel)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    /*
     *
     */
    ProcessesCollapsible.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    };
    return ProcessesCollapsible;
}(SimpleCollapsible));
