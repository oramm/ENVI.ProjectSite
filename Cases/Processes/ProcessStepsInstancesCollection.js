class ProcessStepsInstancesCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject){
        super({id: initParamObject.id, 
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: false,
               isEditable: false, 
               isAddable: false, 
               isDeletable: false,
               connectedRepository: CasesSetup.processesStepsInstancesRepository
              })
        this.parentId = initParamObject.parentId;
        this.status = initParamObject.status;
               
        this.initialise(this.makeList());
    }    
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeItem(dataItem){
        return {    id: dataItem.id,
                    icon:   undefined,
                    $title:  this.makeTitle(dataItem),
                    $description: this.makeDescription(dataItem),
                    dataItem: dataItem
                };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        return dataItem._processStep.name;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem){
        (dataItem.description)? true : dataItem.description="";
        
        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem._processStep.description, 
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
        
        $collectionElementDescription
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom)
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom)
            //.append('<span>' + dataItem.status + '<br></span>');
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.dataItem._case.id==this.parentId);
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
    }
}