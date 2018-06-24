class MilestonesCollection extends SimpleCollection {
    constructor(id,contractId){
        super(id, milestonesRepository);
        this.contractId = contractId;
        
        //this.$addNewModal = new NewExternalAchievementModal('newExternalAchievement', 'Dodaj osiągnięcie', this);
        //this.$editModal = new EditExternalAchievementModal('editExternalAchievement', 'Edytuj osiągnięcie', this);
        
        this.initialise(this.makeList());        
    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
    */
    makeItem(dataItem){
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
        super.selectTrigger(itemId);
        $('#iframeCases').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentProjectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}