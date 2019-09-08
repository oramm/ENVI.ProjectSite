class CasesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                parentId: LettersSetup.milestonesRepository.currentItem.id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                connectedRepository: LettersSetup.casesRepository
                //subitemsCount: 12
              }) ;
        
        this.addNewModal = new CaseModal(id + '_newCase', 'Dodaj sprawę', this, 'ADD_NEW');
        this.editModal = new CaseModal(id + '_editCase', 'Edytuj sprawę', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
        
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        this.connectedRepository.currentItem.milestoneId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var folderNumber =  (dataItem._type.folderNumber)? dataItem._type.folderNumber : ' ';
        var typeName = (dataItem._type.name)? dataItem._type.name : '[Nie przypisano typu]';
        var name = (dataItem.name)? dataItem.name : ' ';
        var caseNumber = (dataItem._displayNumber)? ' ' + dataItem._displayNumber + ' ' : '';
        
        return {    id: dataItem.id,
                    name: folderNumber + ' ' + typeName + ' | ' + caseNumber + name,
                    $body: $bodyDom,
                    dataItem: dataItem
                };
    }
    
    makeBodyDom(dataItem){
        var $body = $();
        var $bodyDom = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            //.append('<div class="row">Zarządzaj zadaniami</div>')
            .append($body)
            //.append(this.makeScrumBoardTab())
    return $bodyDom;
    }
    
    makeCollapsibleItemsList(){
        return super.makeCollapsibleItemsList().filter((item)=>{
            //console.log('this.parentDataItem.id: %s ==? %s', this.parentDataItem.id, item.dataItem._parent.id)
            return item.dataItem._parent.id==this.parentId
        });
    }
    
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych elementów Collection muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
    }
}