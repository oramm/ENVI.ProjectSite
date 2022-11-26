"use strict";
class ProcessesCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: ProcessesSetup.processesRepository
            //subitemsCount: 12
        });
        this.addNewModal = new ProcessModal(id + '_newProcessModal', 'Dodaj proces', this, 'ADD_NEW');
        this.editModal = new ProcessModal(id + '_editProcessModal', 'Edytuj proces', this, 'EDIT');
        this.addNewStepModal = new StepModal(this.id + '_newStepModal', 'Dodaj krok do procesu', this, 'ADD_NEW');
        this.editStepModal = new StepModal(this.id + '_editStepModal', 'Edytuj krok w procesie', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        item.name = dataItem.name + ' >> typ sprawy: ' + dataItem._caseType.name;
        return item;
    }
    makeBody(dataItem) {
        var $descriptionLabel = $((dataItem.description) ? '<BR>' + dataItem.description : '');
        let subCollection = new StepsCollection({
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
    }
    /*
     *
     */
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    }
}
