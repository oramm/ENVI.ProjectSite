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
        
        this.addNewModal = new LetterModal(id + '_newLetterModal', 'Rejestruj pismo', this, 'ADD_NEW');
        this.editModal = new LetterModal(id + '_editLetterModal', 'Edytuj dane pisma', this, 'EDIT');
        
        
        this.initialise(this.makeCollapsibleItemsList());        
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var name='';
        name += 'Numer&nbsp;<strong>' + dataItem.number + '</strong>, ';
        name += 'Utworzono:&nbsp;<strong>' + dataItem.creationDate +'</strong>, ';
        name += (dataItem.isOur)? 'Nadano:&nbsp;' : 'Otrzymano:&nbsp;';
        name += '<strong>' + dataItem.registrationDate + '</strong>, ';
        name += '<br>Opis:&nbsp;' + dataItem.description + '<br>';
        name += (dataItem.isOur)? 'Odbiorca:&nbsp;' : 'Nadawca:&nbsp;'; 
        name += dataItem.entityName
        return {    id: dataItem.id,
                    name: name,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: this.editModal
                    };
    }
    
    makeBodyDom(dataItem){
        var $casesUl = $('<ul class="collection">')
        for(var i=0; i<dataItem._cases.length; i++){
            var $caseLi = $('<li class="collection-item">')
            var caseLabel;
            if(dataItem._cases[i]._parent._parent.ourId)
                caseLabel = dataItem._cases[i]._parent._parent.ourId;
            else 
                caseLabel = dataItem._cases[i]._parent._parent.number;
            caseLabel += ', ' + dataItem._cases[i]._parent._type._folderNumber + ' ' + 
                         dataItem._cases[i]._parent._type.name + 
                          ' | ';
            caseLabel += dataItem._cases[i]._typeFolderNumber_TypeName_Number_Name;
            
            $caseLi.html(caseLabel);
            $casesUl.append($caseLi);
        }
        var timestamp  = (dataItem._lastUpdated)? Tools.timestampToString(dataItem._lastUpdated) : '[czas wyświelti po odświeżeniu]'
        var $panel = $('<div>')
                .attr('id', 'collapsibleBody' + dataItem.id)
                .attr('letterId',dataItem.id)
                .append($('<strong>Dotyczy spraw:</stron>'))
                .append($casesUl)
                .append($('<span class="comment">Ostania zmiana danych pisma: ' + timestamp + ' ' +
                           'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'));
                
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