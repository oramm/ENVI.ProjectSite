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
var ContractTypesCollapsible = /** @class */ (function (_super) {
    __extends(ContractTypesCollapsible, _super);
    function ContractTypesCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: ContractTypesSetup.contractTypesRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new ContractTypeModal(id + '_newContractType', 'Dodaj typ kontraktu', _this, 'ADD_NEW');
        _this.editModal = new ContractTypeModal(id + '_editContractType', 'Edytuj typ kontraktu', _this, 'EDIT');
        _this.addNewMilestoneTypeContractTypeAssociationModal = new MilestoneTypeContractTypeAssociationModal(_this.id + '_newMilestoneTypeContractTypeAssociation', 'Przypisz typ kamienia do kontraktu typu ', _this, 'ADD_NEW');
        _this.editMilestoneTypeContractTypeAssociationModal = new MilestoneTypeContractTypeAssociationModal(_this.id + '_editMilestoneTypeContractTypeAssociation', 'Edytuj numer folderu', _this, 'EDIT');
        _this.addNewMilestoneType = new MilestoneTypeModal(_this.id + '_newMilestoneType', 'Dodaj nowy typ kamienia', _this, 'ADD_NEW');
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
    ContractTypesCollapsible.prototype.makeItem = function (dataItem) {
        return _super.prototype.makeItem.call(this, dataItem);
    };
    ContractTypesCollapsible.prototype.makeBody = function (dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        var subCollection = new MilestoneTypeContractTypeAssociationsCollection({
            id: 'milestoneTypeContractTypeAssociationsCollection_' + dataItem.id,
            title: "",
            addNewModal: this.addNewMilestoneTypeContractTypeAssociationModal,
            editModal: this.editMilestoneTypeContractTypeAssociationModal,
            parentDataItem: dataItem,
            connectedResultsetComponent: this
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid', dataItem.id)
            .append($descriptionLabel)
            .append('Przypisane typy kamieni')
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    return ContractTypesCollapsible;
}(SimpleCollapsible));
