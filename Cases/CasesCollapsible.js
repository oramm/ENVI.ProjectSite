class CasesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                parentId: CasesSetup.currentMilestone.id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                connectedRepository: CasesSetup.casesRepository
                //subitemsCount: 12
              }) ;
        
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
    var parentItemId = Tools.getUrlVars()['parentItemId'];
    var tabsData = [    { name: 'Zadania - Scrumboard',
                          panel: this.createScrumBoardTab(dataItem).$dom
                        },
                        { name: 'Proces',
                          panel: { id: 'asdasd',
                                   $dom: 'sfdfs'
                                 }
                        }
                    ];
    
    
        
    var $bodyDom = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            //.append('<div class="row">Zarządzaj zadaniami</div>')
            .append(new Tabs({  id: 'caseTabs',
                                parentId: parentItemId,
                                tabsData: tabsData,
                                swipeable: true
                            }).$dom)
            //.append(this.createScrumBoardTab())
    return $bodyDom;
    }
    
    createScrumBoardTab(dataItem){
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
        return new ScrumBoard(statusesCollections);
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