class MyTasksCollection extends SimpleCollection {
    constructor(id, parentId){
        super(id, tasksRepository);
        this.parentId = parentId;
        
        this.$addNewModal = new NewTaskModal(this.id + '_newTask', 'Dodaj zadanie', this);
        this.$editModal = new EditTaskModal(this.id + '_editTask', 'Edytuj zadanie', this);
        
        this.initialise(this.makeList());        
    }    
    /*
     * Dodano atrybut z caseId_Hidden, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
    */
    makeItem(dataItem){
        (dataItem.nameSurnameEmail)? true : dataItem.nameSurnameEmail="";
        var nameSurnameEmailLabel = (dataItem.nameSurnameEmail)? (dataItem.nameSurnameEmail)  + '<BR>': "";
        
        (dataItem.description)? true : dataItem.description="";
        var descriptionLabel = (dataItem.description)? (dataItem.description)  + '<BR>': "";
        
        (dataItem.status)? true : dataItem.status="";
        var statusLabel = (dataItem.status)? (dataItem.status)  + '<BR>': "";
        
        //(dataItem.description)? true : dataItem.description="";
        return {    id: dataItem.id,
                    icon:   'info',
                    title:  dataItem.name,
                    description:    descriptionLabel +
                                    dataItem.deadline + '<BR>' +
                                    statusLabel +
                                    nameSurnameEmailLabel,
                                    
                    editUrl: dataItem.editUrl,
                    caseId_Hidden:  dataItem.caseId
                };
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.caseId_Hidden==this.parentId);
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //$('#iframeCases').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}