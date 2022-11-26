class CaseTemplatesCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject){
        super({id: initParamObject.id, 
               parentDataItem: initParamObject.parentDataItem,
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: true, 
               isAddable: initParamObject.isAddable, 
               isDeletable: true,
               connectedRepository: CaseTypesSetup.caseTemplatesRepository
              })
        this.status = initParamObject.status;
               
        this.initialise(this.makeList());
        this.setAddableMode();
    }
    
    setAddableMode(){
        var isLimitReached = this.parentDataItem.isUniquePerMilestone && 
                            CaseTypesSetup.caseTemplatesRepository.items.filter(
                                     item => item._caseType.id==this.parentDataItem.id
                                 ).length>0
        
        this.isAddable = !isLimitReached;
        this.refreshAddableMode();    
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
        var isUnique = (dataItem._caseType.isUniquePerMilestone)? 'Unikalna w kamieniu' : '';
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem._caseType.name + ' | ' + dataItem.name + ' ' + isUnique, 
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
        
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.dataItem.caseTypeId==this.parentDataItem.id);
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        $('#taskTemplatesDashboard', window.parent.document).attr('src','CaseTypes/TaskTemplates/TaskTemplatesList.html?parentItemId=' + this.connectedRepository.currentItem.id);
    }
}