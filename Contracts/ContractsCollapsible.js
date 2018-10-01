class ContractsCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Kontrakty', connectedRepository);
        
        this.$addNewModal = new NewContractModal(id + '_newContract', 'Dodaj kontrakt', this);
        this.$editModal = new EditContractModal(id + '_editContract', 'Edytuj kontrakt', this);
        this.$addNewOurModal = new NewOurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', this);
        this.$editOurModal = new EditOurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', this);
        
        this.initialise(this.makeCollapsibleItemsList());
        this.$addNewOurModal.preppendTriggerButtonTo(this.$actionsMenu,"Rejestruj umowę ENVI");
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(dataItem.value);
        return {    id: dataItem.id,
                    name: dataItem.number + '; ' + dataItem.name + '; ' + value,
                    $body: $bodyDom  
                    };
    }
    
    makeBodyDom(dataItem){
    var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid',dataItem.id)
            .append(new MilestonesCollection({  id: 'milestonesListCollection' + dataItem.id, 
                                                title: "",
                                                parentId: dataItem.id
                                            }, 
                    ).$dom);
    return $panel;
    }
    
}