class CasesCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id,
               parentDataItem: initParamObject.parentDataItem,
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: false, 
               isAddable: true, 
               isDeletable: false,
               isSelectable: true,
               connectedRepository: MeetingsSetup.casesRepository
              });
        
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
                    dataItem: dataItem
                };
    }
    
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem){
        var folderNumber =  (dataItem._type.folderNumber)? dataItem._type.folderNumber : ' ';
        var typeName = (dataItem._type.name)? dataItem._type.name : '[Nie przypisano typu]';
        var name = (dataItem.name)? dataItem.name : ' ';
        var caseNumber = (dataItem._displayNumber)? ' ' + dataItem._displayNumber + ' ' : '';
        var titleAtomicEditLabel = new AtomicEditLabel(folderNumber + ' ' + typeName + ' | ' + caseNumber + name, 
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
        var $collectionElementDescription = $('<span>');

        if(dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>{
            //console.log('this.parentDataItem.id: %s ==? %s', this.parentDataItem.id, item.dataItem._parent.id)
            return item.dataItem._parent.id==this.parentDataItem.id
        });
    }
    
    selectTrigger(itemId){
        if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId){
            super.selectTrigger(itemId);
            $('[id*=meetingArrangementsCollection] .actionsMenu').show();
        }
    }
}