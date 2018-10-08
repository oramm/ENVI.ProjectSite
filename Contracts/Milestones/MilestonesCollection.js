class MilestonesCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id, 
               title: initParamObject.title,
               isPlain: true, 
               hasFilter: true,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               connectedRepository: milestonesRepository
              });
        this.parentId = initParamObject.parentId;

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
                    //icon:   'info',
                    $title:  this.makeTitle(dataItem),
                    $description:    $(dataItem.description + '<BR>' +
                                    dataItem.startDate + ' - ' + dataItem.endDate + '<BR>' +
                                    dataItem.status),
                    editUrl: dataItem.editUrl,
                    contractId_Hidden:  dataItem.contractId
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
        
       
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
            .append(deadlineAtomicEditLabel.$dom)
            .append(personAtomicEditLabel.$dom)
            .append('<span>' + dataItem.status + '<br></span>');
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.contractId_Hidden==this.parentId);
    }
    
    selectTrigger(itemId){
        if (itemId !== undefined)
            {super.selectTrigger(itemId);
            $('#iframeCases').attr('src','../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    }
}