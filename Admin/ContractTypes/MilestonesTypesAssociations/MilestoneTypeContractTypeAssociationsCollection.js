class MilestoneTypeContractTypeAssociationsCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id,
               parentDataItem: initParamObject.parentDataItem,
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               isSelectable: true,
               connectedRepository: ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository,
              });
        this.initialise(this.makeList());
        //podłącz do nadrzędnego collapsibla, żeby dostać się do dodatkowych modali
        this.connectedResultsetComponent = initParamObject.connectedResultsetComponent;
        this.connectedResultsetComponent.addNewMilestoneType.preppendTriggerButtonTo(this.$actionsMenu,"Dodaj typ kamienia",this);
        
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
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem.folderNumber + ' ' + dataItem._milestoneType.name, 
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
        
        if(dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>{
            return item.dataItem._contractType.id==this.parentDataItem.id;
        });
    }
    
    selectTrigger(itemId){
        //var isDashboardLoaded = $('#contractDashboard').attr('src') && $('#contractDashboard').attr('src').includes('ContractDashboard');
        //if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId ||
        //    isDashboardLoaded){
        
        super.selectTrigger(itemId);
        //$('#contractTypeDashboard').attr('src','CasesTemplates/CasesTemplatesList.html?parentItemId=' + this.connectedRepository.currentItem.id  + '&contractId=' + this.connectedRepository.currentItem.contractId);
        
        //}
    }
}