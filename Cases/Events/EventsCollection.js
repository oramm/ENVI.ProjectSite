class EventsCollection extends SimpleCollection {
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
               editModal: initParamObject.editModal,
               isPlain: true, 
               hasFilter: true,
               isEditable: false, 
               isAddable: false, 
               isDeletable: false,
               connectedRepository: CasesSetup.eventsRepository
              })
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
        if (!dataItem.description) 
            dataItem.description="";
        
        var name='';
        name += 'Pismo: ' + dataItem.description + ' ';
        return name;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem){
        var description ='';
        description += (dataItem.isOur)? 'Do:&nbsp;' : 'Od:&nbsp;'; 
        description += dataItem.entityName + '<br>';
        description += 'Numer&nbsp;<strong>' + dataItem.number + '</strong>, ';
        description += 'Utworzono:&nbsp;<strong>' + dataItem.creationDate +'</strong>, ';
        description += (dataItem.isOur)? 'Nadano:&nbsp;' : 'Otrzymano:&nbsp;';
        description += '<strong>' + dataItem.registrationDate + '</strong>, ';
        var $collectionElementDescription = $('<span>');
        
        $collectionElementDescription
            .append($('<span>' + description + '</span><br>'))
            .append($('<span class="comment">Ostania zmiana danych pisma: ' + Tools.timestampToString(dataItem._lastUpdated) + ' ' +
                           'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'));
        
        return $collectionElementDescription;
    }
    
    makeList(){
        return super.makeList().filter((item)=>item.dataItem._case.id==this.parentDataItem.id);
    }
    
    selectTrigger(itemId){
        super.selectTrigger(itemId);
    }
}