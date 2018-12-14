class CasesCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Sprawę', connectedRepository) ;
        
        this.addNewModal = new CaseModal(id + '_newCase', 'Dodaj sprawę', this, 'ADD_NEW');
        this.editModal = new CaseModal(id + '_editCase', 'Edytuj sprawę', this, 'EDIT');
        //modale dla TasksCollection:
        this.addNewTaskModal = new TaskModal(this.id + '_newTask', 'Dodaj zadanie', this, 'ADD_NEW');
        this.editTaskModal = new TaskModal(this.id + '_editTask', 'Edytuj zadanie', this, 'EDIT');
        
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
        return {    id: dataItem.id,
                    name: dataItem.name,
                    $body: $bodyDom  
                    };
    }
    
    makeBodyDom(dataItem){
    var statusesCollections = [];
    var backlogCollection = new TasksCollection({   id: 'backlogCollection_' + dataItem.id + '_status' + 0, 
                                                    parentId: dataItem.id,
                                                    addNewModal: this.addNewTaskModal,
                                                    editModal: this.editTaskModal,
                                                    title: TasksSetup.statusNames[0],
                                                    status: TasksSetup.statusNames[0],
                                                    isAddable: true
                                                });
    backlogCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[0]);
    statusesCollections.push(backlogCollection);
    
    for (var i=1; i<TasksSetup.statusNames.length; i++){
            var tasksCollection = new TasksCollection({     id: 'tasksListCollection_' + dataItem.id + '_status' + i, 
                                                            parentId: dataItem.id,
                                                            editModal: this.editTaskModal,
                                                            title: TasksSetup.statusNames[i],
                                                            status: TasksSetup.statusNames[i],
                                                            isAddable: false
                                                      });
            tasksCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[i]);
            statusesCollections.push(tasksCollection);
    }
        
    var $bodyDom = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            .append(new ScrumBoard(statusesCollections).$dom)
    return $bodyDom;
    }
    
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych elementów Collection muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        TasksSetup.tasksRepository.currentItem.caseId = this.connectedRepository.currentItem.id;
    }
}