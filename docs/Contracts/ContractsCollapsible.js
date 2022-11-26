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
var ContractsCollapsible = /** @class */ (function (_super) {
    __extends(ContractsCollapsible, _super);
    function ContractsCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: ContractsSetup.contractsRepository,
            connectedRepositoryGetRoute: "contracts/?projectId=" + contractsRepository.parentItemId,
            minimumItemsToFilter: 1
        }) || this;
        _this.formatterPln = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
        _this.addNewModal = new ContractModal(id + '_newContract', 'Dodaj kontrakt', _this, 'ADD_NEW');
        _this.editModal = new ContractModal(id + '_editContract', 'Edytuj kontrakt', _this, 'EDIT');
        _this.addNewOurModal = new OurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', _this, 'ADD_NEW');
        _this.editOurModal = new OurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', _this, 'EDIT');
        _this.addNewMilestoneModal = new MilestoneModal(_this.id + '_newMilestone', 'Dodaj kamień', _this, 'ADD_NEW');
        _this.editMilestoneModal = new MilestoneModal(_this.id + '_editMilestone', 'Edytuj kamień milowy', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        _this.addNewOurModal.preppendTriggerButtonTo(_this.$actionsMenu, "Rejestruj umowę ENVI", _this);
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        _this.connectedRepository.currentItem.projectId = _this.connectedRepository.parentItemId;
        return _this;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    ContractsCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        var editModal = (dataItem.ourId) ? this.editOurModal : this.editModal;
        var valueLabel = '';
        if (dataItem.value)
            valueLabel = this.formatterPln.format(dataItem.value);
        var ourId = (dataItem.ourId) ? '<strong>' + dataItem.ourId + '</strong>; ' : '';
        item.name = dataItem.number + '; ' + ourId + dataItem.name + '; ' + valueLabel;
        item.editModal = editModal;
        item.subitemsCount = undefined;
        return item;
    };
    ContractsCollapsible.prototype.makeBody = function (dataItem) {
        var subCollection = new MilestonesCollection({
            id: 'milestonesListCollection' + dataItem.id,
            title: "Kamienie milowe",
            addNewModal: this.addNewMilestoneModal,
            editModal: this.editMilestoneModal,
            parentDataItem: dataItem
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid', dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    /*
     * Ustawia pryciski edycji wierszy,
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    ContractsCollapsible.prototype.addRowCrudButtons = function (row) {
        var $crudMenu = row.$dom.find('.collapsible-header > .crudButtons');
        if (row.dataItem._gdFolderUrl)
            $crudMenu.append(new ExternalResourcesIconLink('GD_ICON', row.dataItem._gdFolderUrl).$dom);
        if (this.isDeletable || this.isEditable) {
            var $crudMenu = row.$dom.find('.collapsible-header > .crudButtons');
            if (row.dataItem.ourId) {
                $crudMenu
                    .append('<span data-target="' + this.editOurModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
                row.$dom.attr('isOur', 'true');
            }
            else
                $crudMenu
                    .append('<span data-target="' + this.editModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
            if (this.isDeletable)
                $crudMenu
                    .append('<span class="collapsibleItemDelete"><i class="material-icons">delete</i></span>');
        }
    };
    /*
     *
     */
    ContractsCollapsible.prototype.selectTrigger = function (itemId) {
        var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        _super.prototype.selectTrigger.call(this, itemId);
        if (itemId !== undefined &&
            this.connectedRepository.currentItem.id != itemId ||
            !isDashboardLoaded) {
            $('#contractDashboard').attr('src', 'ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
        }
    };
    return ContractsCollapsible;
}(SimpleCollapsible));
