class MaterialCardsCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,  
                hasFilter: false,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: MaterialCardsSetup.materialCardsRepository,
                //subitemsCount: 12
              });
        
        this.addNewModal = new MaterialCardModalEngineer(id + '_newMaterialCard', 'Złoż wniosek', this, 'ADD_NEW');
        this.editModal = new MaterialCardModalEngineer(id + '_editMaterialCard', 'Edytuj wniosek', this, 'EDIT');
        this.editModalContractor = new MaterialCardModalContractor(id + '_editMaterialCardMaterialCardContractor', 'Edytuj wniosek (Wykonawca)', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var collapsibleItemName = dataItem._case._displayNumber + ' ' + dataItem._name
        if(dataItem.deadline) collapsibleItemName =+ '<br>Załatwić do: ' + dataItem.deadline;
        
        var editModal;
        if(dataItem.status.match(/Nowe|W trakcie/i))     //'Nowe','W trakcie','Do akceptacji','Zakończone'
            editModal = this.editModalContractor;
        else editModal = this.editModal;
        
        return {    id: dataItem.id,
                    name: collapsibleItemName,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: editModal
                };
    }
    
    makeBodyDom(dataItem){
        var $panel = $('<div>')
                .attr('id', 'collapsibleBodyForMaterialCard' + dataItem.id)
                .attr('materialCardid',dataItem.id)
                .attr('status',dataItem.status)
                .append('<b>Opis:</b><br>' + dataItem._description + '<br>')
                .append('<b>Uwagi:</b><br>' + dataItem.contractorsDescription)
                .append(new Badge(dataItem.id, dataItem.status, 'light-blue').$dom);
        return $panel;
    }
    

   
}