"use strict";
class RisksCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: RisksSetup.risksRepository
            //subitemsCount: 12
        });
        this.addNewModal = new RiskModal(id + '_newRisk', 'Zgłoś ryzyko', this, 'ADD_NEW');
        this.editModal = new RiskModal(id + '_editRisk', 'Edytuj rysyko', this, 'EDIT');
        //modale dla ReactionsCollection:
        this.addNewReactionModal = new ReactionModal(this.id + '_newReaction', 'Dodaj zadanie', this, 'ADD_NEW');
        this.editReactionModal = new ReactionModal(this.id + '_editReaction', 'Edytuj zadanie', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        //this.connectedRepository.currentItem._parent =  RisksSetup.milestonesRepository.currentItem;
        //this.connectedRepository.currentItem._parent._parent = RisksSetup.contractsRepository.currentItem;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        const folderNumber = (dataItem._case._type.folderNumber) ? dataItem._case._type.folderNumber : '';
        const typeName = dataItem._case._type.name;
        let name = (dataItem._case.name) ? dataItem._case.name : '';
        dataItem._rate = dataItem.probability * dataItem.overallImpact;
        item.name = dataItem._parent._folderNumber + ' ' + dataItem._parent._type.name + ' | ' +
            folderNumber + ' ' + typeName + ' | ' + name + '<BR>' +
            'Stopień: <strong>' + dataItem._rate + '<strong>';
        return item;
    }
    makeBody(dataItem) {
        let subCollection = new ReactionsCollection({
            id: 'reactionsListCollection_' + dataItem.id,
            parentDataItem: dataItem._case,
            title: 'Reakcje na ryzyko',
            isAddable: true
        });
        let $panel = $('<div>')
            .attr('id', 'reactionsActionsMenuForRisk' + dataItem.id)
            .attr('riskid', dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    }
}
