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
        this.editModalContractor = new MaterialCardModalContractor(id + '_editMaterialCardMaterialCardContractor', 'Edytuj problem W', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var collapsibleItemName = dataItem._name
        if(dataItem._deadline) collapsibleItemName =+ '<br>Załatwić do: ' + dataItem._deadline;
        return {    id: dataItem.id,
                    name: collapsibleItemName,
                    $body: $bodyDom,
                    dataItem: dataItem
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
    
    /*
     * Ustawia pryciski edycji wierszy, 
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    addRowCrudButtons(row){
        var $crudMenu = row.$dom.find('.collapsible-header > .crudButtons');
        if (row.dataItem._gdFolderUrl) $crudMenu.append(Setup.$externalResourcesIconLink('GD_ICON',row.dataItem._gdFolderUrl));
        if (this.isDeletable || this.isEditable){
            var $currentRowEditIcon = this.$rowEditIcon();
            $crudMenu
                .append($currentRowEditIcon);
            //przepnij do właściwego modala
            if(row.dataItem.status.match(/W trakcie/i)){
                row.$dom.attr('editModal','editModalContractor'); 
                
                $currentRowEditIcon.attr('data-target',this.editModalContractor.id);
            }
            if (this.isDeletable) 
                $crudMenu.append(this.$rowDeleteIcon());
        }
    }
    
    /*
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    setEditAction(){
        this.$dom.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemEdit").click(function() { 
                                        var condition = $(this).closest('.collapsible-item').attr('editModal');
                                        $(this).closest('.collapsible-item').trigger('click');
                                        _this.getProperModal(condition).triggerAction(_this);
                                        });
    }
    
    getProperModal(condition){
        switch (condition) {
            case 'editModalContractor':
                return this.editModalContractor;
            default :
                return this.editModal;
        }
        
    }    
}