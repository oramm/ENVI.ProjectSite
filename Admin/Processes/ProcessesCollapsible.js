class ProcessesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: ProcessesSetup.processesRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new ProcessModal(id + '_newProcessModal', 'Dodaj proces', this, 'ADD_NEW');
        this.editModal = new ProcessModal(id + '_editProcessModal', 'Edytuj proces', this, 'EDIT');
        
        
        this.addNewStepModal = new StepModal(this.id + '_newStepModal', 'Dodaj krok do procesu', this, 'ADD_NEW');
        this.editStepModal = new StepModal(this.id + '_editStepModal', 'Edytuj krok w procesie', this, 'EDIT');
        
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
                    name: dataItem.name + ' >> typ sprawy: ' + dataItem._caseType.name,
                    $body: $bodyDom,
                    dataItem: dataItem
                    };
    }
    
    makeBodyDom(dataItem){
        var $descriptionLabel = $((dataItem.description)?'<BR>' + dataItem.description  : '');
        
        var $panel = $('<div>')
                .attr('id', 'collapsibleBodyForContract' + dataItem.id)
                .attr('contractid',dataItem.id)
                .append($descriptionLabel)
                .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
                .append(new StepsCollection({id: 'stepssCollection_' + dataItem.id, 
                            title: "",
                            addNewModal: this.addNewStepModal,
                            editModal: this.editStepModal,
                            parentDataItem: dataItem,
                            connectedResultsetComponent: this
                           }).$dom);
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