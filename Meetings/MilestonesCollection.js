class MilestonesCollection extends SimpleCollection {
    constructor(initParamObject){
        super({id: initParamObject.id,
               parentDataItem: initParamObject.parentDataItem,
               title: initParamObject.title,
               addNewModal: initParamObject.addNewModal,
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: false, 
               isAddable: false, 
               isDeletable: false,
               isSelectable: true,
               connectedRepository: MeetingsSetup.milestonesRepository
              });
        this.$casesPanel = initParamObject.$casesPanel;
        this.initialise(this.makeList());        
        
        this.addNewCaseModal = new CaseModal(this.id + '_newCase', 'Dodaj sprawę', this, 'ADD_NEW');
        this.editCaseModal = new CaseModal(this.id + '_editCase', 'Edytuj sprawę', this, 'EDIT');
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
        var titleAtomicEditLabel = new AtomicEditLabel( dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name, 
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
            return item.dataItem._parent.id==this.parentDataItem.id
        });
    }
    
    selectTrigger(itemId){
        if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId){
            super.selectTrigger(itemId);
            $('[id*=meetingArrangementsCollection] .actionsMenu').hide();
            this.$casesPanel.find('[id*=container]')
                .replaceWith(new CasesCollection({ id: 'casesListCollection' + itemId, 
                                                        title: '',
                                                        parentDataItem: this.connectedRepository.currentItem,
                                                        addNewModal: this.addNewCaseModal,
                                                        editModal: this.editCaseModal,
                                                      }, 
                                                     ).$dom)
        }
    }
}