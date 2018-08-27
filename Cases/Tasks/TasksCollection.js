class TasksCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject){
        super({id: initParamObject.id, 
               title: initParamObject.title,
               isPlain: true, 
               hasFilter: false,
               isEditable: true, 
               isAddable: initParamObject.isAddable, 
               isDeletable: true,
               connectedRepository: TasksSetup.tasksRepository
              })
        this.parentId = initParamObject.parentId;
        this.status = initParamObject.status;
        
        if (this.isAddable) 
            this.$addNewModal = new NewTaskModal(this.id + '_newTask', 'Dodaj zadanie', this);
        
        this.$editModal = new EditTaskModal(this.id + '_editTask', 'Edytuj zadanie', this);
        
        this.initialise(this.makeList());        
    }    
    /*
     * Dodano atrybut z caseId_Hidden, żeby szybciej filtorwać widok po stronie klienta zamiast przez SELECT z db
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeItem(dataItem){
        //potrzebne sprawdzenie i ew. podmiana na '', żeby nie wyświetlać takstu 'undefined'
        (dataItem.nameSurnameEmail)? true : dataItem.nameSurnameEmail="";
        var nameSurnameEmailLabel = (dataItem.nameSurnameEmail)? (dataItem.nameSurnameEmail)  + '<BR>': "";
        
        return {    id: dataItem.id,
                    icon:   undefined,
                    $title:  this.makeTitle(dataItem),
                    $description: this.makeDescription(dataItem),

                    caseId_Hidden:  dataItem.caseId,
                    status_Hidden:  dataItem.status                    
                };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem.name, 
                                                        dataItem, 
                                                        new InputTextField (this.id +  '_' + dataItem.id + '_tmpNameEdit_TextField','Edytuj', undefined, true, 150),
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
                                                        new InputTextField (this.id +  '_' + dataItem.id + '_tmpEditDescription_TextField','Edytuj', undefined, true, 150),
                                                        'description',
                                                        this);
        
        
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, 
                                                        dataItem, 
                                                        new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField','Termin wykonania', true),
                                                        'deadline',
                                                        this);
        
        
        (dataItem.status)? true : dataItem.status="";
        
        var personAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                     'Imię i nazwisko', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        personAutoCompleteTextField.initialise(personsRepository,"nameSurnameEmail", this.onOwnerChosen, this);
        
        var personAtomicEditLabel = new AtomicEditLabel(dataItem.nameSurnameEmail, 
                                                        dataItem, 
                                                        personAutoCompleteTextField,
                                                        'nameSurnameEmail',
                                                        this);
        
        //var statusSelectField = new SelectField(this.id + '_' + dataItem.id + '_statusSelectField', 'Status', true);
        //statusSelectField.initialise(TasksSetup.statusNames);        
        //var statusAtomicEditLabel = new AtomicEditLabel(dataItem.status, 
        //                                                dataItem, 
        //                                               statusSelectField,
        //                                                'status',
        //                                                this);
        
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.caseId_Hidden==this.parentId && item.status_Hidden == this.status );
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //$('#iframeCases').attr('src','../Cases/CasesList.html?milestoneId=' + this.connectedRepository.currentItem.projectId  + '&contractId=' + this.connectedRepository.currentItem.contractId);
    }
}