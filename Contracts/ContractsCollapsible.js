class ContractsCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: false,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: ContractsSetup.contractsRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new ContractModal(id + '_newContract', 'Dodaj kontrakt', this, 'ADD_NEW');
        this.editModal = new ContractModal(id + '_editContract', 'Edytuj kontrakt', this, 'EDIT');
        this.addNewOurModal = new OurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', this, 'ADD_NEW');
        this.editOurModal = new OurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', this, 'EDIT');
        
        
        this.addNewMilestoneModal = new MilestoneModal(this.id + '_newMilestone', 'Dodaj kamień', this, 'ADD_NEW');
        this.editMilestoneModal = new MilestoneModal(this.id + '_editMilestone', 'Edytuj kamień milowy', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
        this.addNewOurModal.preppendTriggerButtonTo(this.$actionsMenu,"Rejestruj umowę ENVI",this);
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        this.connectedRepository.currentItem.projectId = this.connectedRepository.parentItemId;
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(dataItem.value);
        var ourId = (dataItem.ourId)? '<strong>' + dataItem.ourId + '</strong>; ' : '';
        return {    id: dataItem.id,
                    name: dataItem.number + '; ' + ourId + dataItem.name + '; ' + value,
                    $body: $bodyDom,
                    dataItem: dataItem
                    };
    }
    
    makeBodyDom(dataItem){
        var $panel = $('<div>')
                .attr('id', 'collapsibleBodyForContract' + dataItem.id)
                .attr('contractid',dataItem.id)
                .append(new MilestonesCollection({  id: 'milestonesListCollection' + dataItem.id, 
                                                    title: "",
                                                    addNewModal: this.addNewMilestoneModal,
                                                    editModal: this. editMilestoneModal,
                                                    parentId: dataItem.id
                                                }, 
                        ).$dom);
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
            var $crudMenu = row.$dom.find('.collapsible-header > .crudButtons');
            if (row.dataItem.ourId){ 
                $crudMenu
                    .append('<span data-target="' + this.editOurModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
            row.$dom.attr('isOur','true'); 
            }
            else
                $crudMenu
                    .append('<span data-target="' + this.editModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
            if (this.isDeletable) 
                $crudMenu
                    .append('<span class="collapsibleItemDelete"><i class="material-icons">delete</i></span>');
        }
    }
    
    /*
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    setEditAction(){
        this.$dom.find(".collapsibleItemEdit").off('click');
        var _this = this;
        this.$dom.find(".collapsibleItemEdit").click(function() { 
                                        var isOur = $(this).closest('.collapsible-item')
                                            .attr('isOur')
                                        $(this).closest('.collapsible-item').trigger('click');
                                        (isOur)? _this.editOurModal.triggerAction(_this) : _this.editModal.triggerAction(_this);
                                        });
    }
    /*
     * 
     */
    selectTrigger(itemId){
        if (itemId !== undefined && this.connectedRepository.currentItem.id != itemId){
            super.selectTrigger(itemId);
            $('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    
        }
    }
}