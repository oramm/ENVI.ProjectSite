class MilestonesCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id, 
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               isSelectable: true,
               connectedRepository: MilestonesSetup.milestonesRepository
              });
        //TODO: dodać_parentDataItem = {} zamiast poniższego i przenieść do klasy Collection
        this.parentId = initParamObject.parentId;
        
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
                    $description:    this.makeDescription(dataItem),
                    editUrl: dataItem.editUrl,
                    contractId_Hidden:  dataItem._parent.id,
                    dataItem: dataItem
                };
    }
    
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        var typeString = (dataItem._type.name)? dataItem._type.name : '[Nie przypisano typu]'
        var titleAtomicEditLabel = new AtomicEditLabel( typeString + ' | ' + dataItem.name, 
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
        return super.makeList().filter((item)=>item.contractId_Hidden==this.parentId);
    }
    
    selectTrigger(itemId){
        if (itemId !== undefined)
            {super.selectTrigger(itemId);
            $('#contractDashboard').attr('src','../Cases/CasesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        }
    }
}