class RisksCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Ryzyko', connectedRepository) ;
        
        this.$addNewModal = new RiskModal(id + '_newRisk', 'Zgłoś ryzyko', this, 'ADD_NEW');
        this.editModal = new RiskModal(id + '_editRisk', 'Edytuj rysyko', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
        this.connectedRepository.currentItem.projectId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        return {    id: dataItem.id,
                    name: dataItem._contract.ourIdNumberName + '<BR>' +
                          dataItem.name + ', Stopień: <strong>' + dataItem._rate + '<strong>',
                    $bodyDom: $bodyDom
                    };
    }
    
    makeBodyDom(dataItem){
    var statusesCollections = [];
    var backlogCollection = new ReactionsCollection({   id: 'backlogCollection_' + dataItem.id + '_status' + 0, 
                                                        parentId: dataItem.id,
                                                        title: TasksSetup.statusNames[0],
                                                        status: TasksSetup.statusNames[0],
                                                        isAddable: false
                                                    });
    backlogCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[0]);
    statusesCollections.push(backlogCollection);
    
    for (var i=1; i<TasksSetup.statusNames.length; i++){
            var reactionsCollection = new ReactionsCollection({     id: 'reactionsListCollection_' + dataItem.id + '_status' + i, 
                                                            parentId: dataItem.id, 
                                                            title: TasksSetup.statusNames[i],
                                                            status: TasksSetup.statusNames[i],
                                                            isAddable: false
                                                      });
            reactionsCollection.$dom.children('.collection').attr("status", TasksSetup.statusNames[i]);
            statusesCollections.push(reactionsCollection);
    }
        
    var $bodyDom = $('<div>')
            .attr('id', 'reactionsActionsMenuForRisk' + dataItem.id)
            .attr('riskid',dataItem.id)
            .append('Przyczyna: ' + dataItem.cause)
            .append(new ScrumBoard(statusesCollections).$dom)
    return $bodyDom;
    }   
}