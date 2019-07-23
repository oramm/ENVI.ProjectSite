class MilestoneTypesCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id,
               parentId: initParamObject.parentId,
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               isSelectable: true,
               connectedRepository: ContractTypesSetup.MilestoneTypesRepository
              });
        this.initialise(this.makeList());
        
        this.addNewModal.preppendTriggerButtonTo(this.$actionsMenu,"Przypisz kamień",this);
        
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
                    $description:    this.makeDescription(dataItem),
                    editUrl: dataItem.editUrl,
                    dataItem: dataItem
                };
    }
    
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem._parent.folderNumber + ' ' + dataItem._parent.name + ' | ' + dataItem.name, 
                                                        dataItem, 
                                                        new InputTextField (this.id +  '_' + dataItem.id + '_tmpNameEdit_TextField','Edytuj', undefined, true, 150),
                                                        'name',
                                                        this);
        return titleAtomicEditLabel.$dom;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem){
        (dataItem.description)? true : dataItem.description="";
        
        var $collectionElementDescription = $('<span>');
        //TODO: kiedyś dodać edyzcję dat
        var deadlineAtomicEditLabel = new AtomicEditLabel(dataItem.deadline, 
                                                        dataItem, 
                                                        new DatePicker(this.id + '_' + dataItem.id + '_deadLinePickerField','Termin wykonania', true),
                                                        'deadline',
                                                        this);
        
        (dataItem.status)? true : dataItem.status="";
        if(dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        $collectionElementDescription
            .append('<span>' + dataItem.startDate + ' - ' + dataItem.endDate + '<BR></span>')
            //.append(deadlineAtomicEditLabel.$dom)
            .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom);
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>{
            //console.log('this.parentId: %s ==? %s', this.parentId, item.dataItem._parent.id)
            return item.dataItem._parent._parent.id==this.parentId;
        });
    }
    
    selectTrigger(itemId){
        //var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        //if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId ||
        //    isDashboardLoaded){
        
        super.selectTrigger(itemId);
        $('#contractTypeDashboard').attr('src','CasesTemplates/CasesTemplatesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        
        //}
    }
}