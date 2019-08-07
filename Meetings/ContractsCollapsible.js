class ContractsCollapsible extends SimpleCollapsible {
    constructor(id, $casesPanel){
        super({ id: id,
                hasFilter: true,
                isEditable: false, 
                isAddable: false, 
                isDeletable: false,
                hasArchiveSwitch: true,
                connectedRepository: MeetingsSetup.contractsRepository
                //subitemsCount: 12
              });
        this.$casesPanel = $casesPanel;
        
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        this.connectedRepository.currentItem.projectId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(dataItem.value);
        var ourId = (dataItem.ourId)? '<strong>' + dataItem.ourId + '</strong>; ' : '';
        return {    id: dataItem.id,
                    name: dataItem.number + '; ' + ourId + dataItem.name + '; ' + value,
                    $body: $bodyDom,
                    dataItem: dataItem
                    };
    }
    
    makeBodyDom(dataItem){
        var $panel = $('<div>')
                .attr('id', 'collapsibleBodyForContract' + dataItem.id)
                .attr('contractid',dataItem.id)
                .append(new MilestonesCollection({  id: 'milestonesListCollection' + dataItem.id, 
                                                    title: "Kamienie milowe",
                                                    parentDataItem: dataItem,
                                                    $casesPanel: this.$casesPanel
                                                }, 
                        ).$dom);
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