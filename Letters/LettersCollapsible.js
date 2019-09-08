class LettersCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: LettersSetup.lettersRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new ReceivedLetterModal(id + '_receivedLetterModal', 'Rejestruj pismo przychodzące', this, 'ADD_NEW');
        this.editModal = new ReceivedLetterModal(id + '_editLetterModal', 'Edytuj dane pisma przychodzącego', this, 'EDIT');
        
        
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        return {    id: dataItem.id,
                    name: dataItem.number + ' ' + dataItem.description + '<br>' + dataItem.entityName,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: this.editModal
                    };
    }
    
    makeBodyDom(dataItem){
        var $descriptionLabel = $((dataItem.description)?'<BR>' + dataItem.description  : '');
        
        var $panel = $('<div>')
                .attr('id', 'collapsibleBody' + dataItem.id)
                .attr('letterId',dataItem.id)
                .append($descriptionLabel)

        return $panel;
    }
    
    /*
     * 
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
        }
}