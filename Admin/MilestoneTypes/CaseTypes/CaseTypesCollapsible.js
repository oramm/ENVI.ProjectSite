class CaseTypesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                parentId: CaseTypesSetup.currentMilestoneType.id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                connectedRepository: CaseTypesSetup.caseTypesRepository
                //subitemsCount: 12
              }) ;
        
        this.addNewModal = new CaseTypeModal(id + '_newCaseType', 'Dodaj typ sprawy', this, 'ADD_NEW');
        this.editModal = new CaseTypeModal(id + '_editCase', 'Edytuj typ sprawy', this, 'EDIT');
        //modale dla Collection:
        this.addNewCaseTemplateModal = new CaseTemplateModal(this.id + '_newCaseTemplate', 'Dodaj szablon sprawy', this, 'ADD_NEW');
        this.editCaseTemplateModal = new CaseTemplateModal(this.id + '_editCaseTemplate', 'Edytuj szablon sprawy', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
        
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        //this.connectedRepository.currentItem.milestoneId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var isUnique = (dataItem.isUniquePerMilestone)? '[Unikalna]' : ''
        return {    id: dataItem.id,
                    name: dataItem.folderNumber + ' ' + dataItem.name + ' ' + isUnique,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: this.editModal
                };
    }
    
    makeBodyDom(dataItem){
        var $body = new CaseTemplatesCollection({   id: 'CaseTemplatesCollection_' + dataItem.id, 
                                                    title: "",
                                                    addNewModal: this.addNewCaseTemplateModal, 
                                                    editModal: this.editCaseTemplateModal,
                                                    parentDataItem: dataItem
                                                }).$dom;
        var $bodyDom = $('<div>')
            .attr('id', 'caseTemplatesActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            .append($body)
    return $bodyDom;
    }
    
    
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych elementów Collection muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //TasksSetup.tasksRepository.currentItem.caseId = this.connectedRepository.currentItem.id;
    }
}