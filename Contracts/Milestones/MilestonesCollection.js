class MilestonesCollection extends SimpleCollection {
    constructor(id,contractId){
        super(id, milestonesRepository);
        this.contractId = contractId;

        this.$addNewModal = new NewMilestoneModal(this.id + '_newMilestone', 'Dodaj kamień', this);
        this.$editModal = new EditMilestoneModal(this.id + '_editMilestone', 'Edytuj kamień milowy', this);
        
        this.initialise(this.makeList());        
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    makeItem(dataItem){
        (dataItem.description)? true : dataItem.description="";
        return {    id: dataItem.id,
                    icon:   'info',
                    title:  dataItem.name,
                    description:    dataItem.description + '<BR>' +
                                    dataItem.startDate + ' - ' + dataItem.endDate + '<BR>' +
                                    dataItem.status,
                    editUrl: dataItem.editUrl,
                    contractId_Hidden:  dataItem.contractId
                };
    }
    
    
    makeList(){
        return super.makeList().filter((item)=>item.contractId_Hidden==this.contractId);
    }
    
    selectTrigger(itemId){
        if (itemId !== undefined)
            {super.selectTrigger(itemId);
            $('#iframeCases').attr('src','../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    }
}