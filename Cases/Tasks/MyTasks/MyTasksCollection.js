class MyTasksCollection extends SimpleCollection {
    constructor(id){
        super({id: id, 
               isPlain: true, 
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               connectedRepository: tasksRepository
              });

        this.addNewModal = new TaskModal(this.id + '_newTask', 'Dodaj zadanie', this, 'ADD_NEW');
        this.editModal = new TaskModal(this.id + '_editTask', 'Edytuj zadanie', this,'EDIT');
        
        this.initialise(this.makeList());        
    }    
    /*
     * Dodano atrybut z caseId_Hidden, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
    */
    makeItem(dataItem){
        (dataItem._owner._nameSurnameEmail)? true : dataItem._nameSurnameEmail="";
        var nameSurnameEmailLabel = (dataItem._owner._nameSurnameEmail)? (dataItem._owner._nameSurnameEmail)  + '<BR>': "";
        
        (dataItem.description)? true : dataItem.description="";
        var descriptionLabel = (dataItem.description)? (dataItem.description)  + '<BR>': "";
        
        (dataItem.status)? true : dataItem.status="";
        var statusLabel = (dataItem.status)? (dataItem.status)  + '<BR>': "";
        
        //(dataItem.description)? true : dataItem.description="";
        return {    id: dataItem.id,
                    $title:  this.makeTitle(dataItem),
                    $description:    this.makeDescription(dataItem),
                    userEmail_Hidden:  dataItem._owner._nameSurnameEmail,
                    dataItem: dataItem
                };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem.name, 
                                                        dataItem, 
                                                        {   input: new InputTextField (this.id +  '_' + dataItem.id + '_tmpNameEdit_TextField','Edytuj', undefined, true, 150),
                                                            dataItemKeyName: 'name'
                                                        },
                                                        'name',
                                                        this);
        return titleAtomicEditLabel.$dom
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem){
        (dataItem.description)? true : dataItem.description="";
        
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description, 
                                                        dataItem, 
                                                        {   input: new InputTextField (this.id +  '_' + dataItem.id + '_tmpEditDescription_TextField','Edytuj', undefined, true, 150),
                                                            dataItemKeyName: 'description'
                                                        },
                                                        'description',
                                                        this);
        
        
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, 
                                                        dataItem, 
                                                        {   input: new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField','Termin wykonania', true),
                                                            dataItemKeyName: 'deadline'
                                                        },
                                                        'deadline',
                                                        this);
        
        
        (dataItem.status)? true : dataItem.status="";
        
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.userEmail_Hidden.includes(user.getEmail()));
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}