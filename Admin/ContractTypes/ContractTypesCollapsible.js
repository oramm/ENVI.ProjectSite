class ContractTypesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: ContractTypesSetup.contractTypesRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new ContractTypeModal(id + '_newContractType', 'Dodaj typ kontraktu', this, 'ADD_NEW');
        this.editModal = new ContractTypeModal(id + '_editContractType', 'Edytuj typ kontraktu', this, 'EDIT');
        
        
        this.addNewMilestoneTypeContractTypeAssociationModal = new MilestoneTypeContractTypeAssociationModal(this.id + '_newMilestoneTypeContractTypeAssociation', 'Przypisz typ kamienia do kontraktu typu ', this, 'ADD_NEW');
        this.editMilestoneTypeContractTypeAssociationModal = new MilestoneTypeContractTypeAssociationModal(this.id + '_editMilestoneTypeContractTypeAssociation', 'Edytuj numer folderu', this, 'EDIT');
        
        this.addNewMilestoneType = new MilestoneTypeModal(this.id + '_newMilestoneType', 'Dodaj nowy typ kamienia', this, 'ADD_NEW');
        
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
                    name: dataItem.name,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: this.editModal
                    };
    }
    
    makeBodyDom(dataItem){
        var $descriptionLabel = $((dataItem.description)?'<BR>' + dataItem.description  : '');
        
        var $panel = $('<div>')
                .attr('id', 'collapsibleBodyForContract' + dataItem.id)
                .attr('contractid',dataItem.id)
                .append($descriptionLabel)
                .append('Przypisane typy kamieni')
                .append(new MilestoneTypeContractTypeAssociationsCollection({id: 'milestoneTypeContractTypeAssociationsCollection_' + dataItem.id, 
                            title: "",
                            addNewModal: this.addNewMilestoneTypeContractTypeAssociationModal,
                            editModal: this.editMilestoneTypeContractTypeAssociationModal,
                            parentDataItem: dataItem,
                            connectedResultsetComponent: this
                           }).$dom);
        return $panel;
    }
    
    /*
     * 
     */
    selectTrigger(itemId){
        var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard'); 
        if (itemId !== undefined && 
            this.connectedRepository.currentItem.id != itemId ||
            !isDashboardLoaded){
            
            super.selectTrigger(itemId);
            $('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    
        }
    }
}