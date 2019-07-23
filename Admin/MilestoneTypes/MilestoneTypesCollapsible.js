class MilestoneTypesCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: false,
                connectedRepository: ContractTypesSetup.milestoneTypesRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new MilestoneTypeModal(id + '_newMilestoneType', 'Dodaj typ kamienia', this, 'ADD_NEW');
        this.editModal = new MilestoneTypeModal(id + '_editMilestoneType', 'Edytuj typ kamienia', this, 'EDIT');
        
        this.addNewMilestoneTemplateModal = new MilestoneTemplateModal(this.id + '_newMilestoneTemplate', 'Dodaj szablon kamienia milowego', this, 'ADD_NEW');
        this.editMilestoneTemplateModal = new MilestoneTemplateModal(this.id + '_editMilestoneTemplate', 'Edytuj szablon kamienia milowego', this, 'EDIT');
        
        
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
                    name: dataItem._contractTypeNameTmp + ' | ' + dataItem.name,
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
                .append(new MilestoneTemplatesCollection({id: 'milestoneTemplatesCollection_' + dataItem.id, 
                                                                    title: "",
                                                        addNewModal: this.addNewMilestoneTemplateModal,
                                                        editModal: this. editMilestoneTemplateModal,
                                                        parentId: dataItem.id
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