class CasesCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Sprawę', connectedRepository) ;
        
        this.$addNewModal = new NewCaseModal(id + '_newCase', 'Dodaj sprawę', this);
        this.$editModal = new EditCaseModal(id + '_editCase', 'Edytuj sprawę', this);
        
        this.initialise(this.makeCollapsibleItemsList());
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
    var $bodyDom = $('<div>')
            .attr('id', 'tasksActionsMenuForCase' + dataItem.id)
            .attr('caseid',dataItem.id)
            .append(new TasksCollection('tasksListCollection' + dataItem.id, dataItem.id).$dom)
    return $bodyDom;
    }
}