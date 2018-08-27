class RolesCollection extends SimpleCollection {
    constructor(id){
        super({id: id, 
               title: "Role",
               isPlain: false, 
               hasFilter: false,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               connectedRepository: rolesRepository
              });
        
        this.$addNewModal = new NewRoleModal(this.id + '_newRoleModal', 'Dodaj rolę', this);
        this.$editModal = new EditRoleModal(this.id + '_editRoleModal', 'Edytuj role', this);
        
        this.initialise(this.makeList());        
    }
    
    makeItem(dataItem){
        return {    id: dataItem.id,
                    icon:   'person',
                    $title:  this.makeTitle(dataItem),
                    $description:    $('<span>').html(dataItem.description)
                    
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
                                                        new ReachTextArea (this.id +  '_' + dataItem.id + '_tmpDescriptionReachTextArea','Opis', true, 500),
                                                        'description',
                                                        this);
        
        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)
        
        return $collectionElementDescription;
    }
}