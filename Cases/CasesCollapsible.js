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
        this.editProcessStepInstanceModal = new ProcessStepsInstancesModal(this.id + '_editProcessStepInstance', 'Edytuj krok w procesie', this, 'EDIT');
        
        this.addNewOurLetterModal = new ProcessOurLetterModal(id + '_newOurLetterModal', 'Rejestruj pismo wychodzące', this, 'ADD_NEW');
        this.editOurLetterModal = new ProcessOurLetterModal(id + '_editOurLetterModal', 'Edytuj dane pisma wychodzącego', this, 'EDIT');
        this.appendLetterAttachmentsModal = new ProcessAppendLetterAttachmentsModal(id + '_appendLetterAttachmentsModal', 'Dodaj załączniki', this, 'EDIT');
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
                    dataItem: dataItem,
                    editModal: this.editModal
                };
    }
    
    makeBodyDom(dataItem){
        var $body = this.makeTabs(dataItem).$dom;
        var $bodyDom = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            //.append('<div class="row">Zarządzaj zadaniami</div>')
            .append($body)
            //.append(this.makeScrumBoardTab())
    return $bodyDom;
    }
    
    makeTabs(dataItem){
        var parentItemId = Tools.getUrlVars()['parentItemId'];    
        var tabsData = [{ name: 'Zadania - Scrumboard',
                          panel: this.makeScrumBoardTab(dataItem).$dom
                        },
                        { name: 'Wydarzenia',
                          panel:  this.makeEventsTab(dataItem)
                        }
                       ];
        if(dataItem._processesInstances.length>0)
            tabsData.push({ name: 'Proces',
                            panel:  this.makeProcessTab(dataItem)
                          })
        return new Tabs({   id: 'caseTabs-' + dataItem.id,
                            parentId: parentItemId,
                            tabsData: tabsData,
                            swipeable: true
                        })
    }
    
    makeScrumBoardTab(dataItem){
        var statusesCollections = [];
        var backlogCollection = new TasksCollection({   id: 'backlogCollection_' + dataItem.id + '_status' + 0, 
                                                        parentDataItem: dataItem,
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
                                                                parentDataItem: dataItem,
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
    
    makeProcessTab(dataItem){
        if(dataItem._processesInstances.length>1) throw new Error('Ten widok nie  obsługuje jeszcze wielu procesów dla jednej sprawy!');
        var $processDataPanel = $('<div>');
        var stepsCollection = new ProcessStepsInstancesCollection({ id: 'processStepsCollection_' + dataItem.id, 
                                                                     title: "",
                                                                     editModal: this.editProcessStepInstanceModal,
                                                                     addNewOurLetterModal: this.addNewOurLetterModal,
                                                                     editOurLetterModal: this.editOurLetterModal,
                                                                     appendLetterAttachmentsModal: this.appendLetterAttachmentsModal,
                                                                     parentDataItem: dataItem
                                                                    });
        $processDataPanel
            .append(dataItem._processesInstances[0]._process.name + '<BR>')
            .append(dataItem._processesInstances[0]._process.descripton)
            .append(stepsCollection.$dom);
        return $processDataPanel;
    }
    
    makeEventsTab(dataItem){
        var $processDataPanel = $('<div>');
        var eventsCollection = new EventsCollection({id: 'eventsCollection_' + dataItem.id, 
                                                     title: "",
                                                     parentDataItem: dataItem
                                                    });
        $processDataPanel
            .append(eventsCollection.$dom);
        return $processDataPanel;
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