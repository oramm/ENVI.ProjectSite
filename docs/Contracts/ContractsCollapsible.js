"use strict";
class ContractsCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: ContractsSetup.contractsRepository,
            connectedRepositoryGetRoute: `contracts/?projectId=${contractsRepository.parentItemId}`,
            minimumItemsToFilter: 1
        });
        this.formatterPln = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
        this.addNewModal = new ContractModal(id + '_newContract', 'Dodaj kontrakt', this, 'ADD_NEW');
        this.editModal = new ContractModal(id + '_editContract', 'Edytuj kontrakt', this, 'EDIT');
        this.addNewOurModal = new OurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', this, 'ADD_NEW');
        this.editOurModal = new OurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', this, 'EDIT');
        this.addNewMilestoneModal = new MilestoneModal(this.id + '_newMilestone', 'Dodaj kamień', this, 'ADD_NEW');
        this.editMilestoneModal = new MilestoneModal(this.id + '_editMilestone', 'Edytuj kamień milowy', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
        this.addNewOurModal.preppendTriggerButtonTo(this.$actionsMenu, "Rejestruj umowę ENVI", this);
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        this.connectedRepository.currentItem.projectId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        let editModal = (dataItem.ourId) ? this.editOurModal : this.editModal;
        let valueLabel = '';
        if (dataItem.value)
            valueLabel = this.formatterPln.format(dataItem.value);
        const ourId = (dataItem.ourId) ? '<strong>' + dataItem.ourId + '</strong>; ' : '';
        item.name = dataItem.number + '; ' + ourId + dataItem.name + '; ' + valueLabel;
        item.editModal = editModal;
        item.subitemsCount = undefined;
        return item;
    }
    makeBody(dataItem) {
        let subCollection = new MilestonesCollection({
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
    }
    /*
     * Ustawia pryciski edycji wierszy,
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    addRowCrudButtons(row) {
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
    }
    /*
     *
     */
    selectTrigger(itemId) {
        const isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        super.selectTrigger(itemId);
        if (itemId !== undefined &&
            this.connectedRepository.currentItem.id != itemId ||
            !isDashboardLoaded) {
            $('#contractDashboard').attr('src', 'ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
        }
    }
}
