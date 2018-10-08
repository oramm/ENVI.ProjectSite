class ContractsCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Kontrakty', connectedRepository);
        
        this.$addNewModal = new NewContractModal(id + '_newContract', 'Dodaj kontrakt', this);
        this.$editModal = new EditContractModal(id + '_editContract', 'Edytuj kontrakt', this);
        this.$addNewOurModal = new NewOurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', this);
        this.$editOurModal = new EditOurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', this);
        
        this.initialise(this.makeCollapsibleItemsList());
        this.$addNewOurModal.preppendTriggerButtonTo(this.$actionsMenu,"Rejestruj umowę ENVI");
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        var value = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(dataItem.value);
        return {    id: dataItem.id,
                    name: dataItem.number + '; ' + dataItem.name + '; ' + value,
                    $body: $bodyDom  
                    };
    }
    
    makeBodyDom(dataItem){
    var $panel = $('<div>')
            .attr('id', 'collapsibleBodyForContract' + dataItem.id)
            .attr('contractid',dataItem.id)
            .append(new MilestonesCollection({  id: 'milestonesListCollection' + dataItem.id, 
                                                title: "",
                                                parentId: dataItem.id
                                            }, 
                    ).$dom);
    return $panel;
    }
    /*
     * Ustawia pryciski edycji wierszy, 
     * musi być przeciążona bo mamy dwa różne modale edycji przypisane co Collapsilbe
     */
    addRowCrudButtons($row){
        var contractId = $row.attr("itemId");
        var contract = ContractsSetup.contractsRepository.items.filter(function(item){return item.id==contractId})[0];
        
        if (this.isDeletable || this.isEditable){
            var $crudMenu = $row.find('.collapsible-header > .crudButtons');
            if (contract.ourId){ 
                $crudMenu
                    .append('<span data-target="' + this.$editOurModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
            $row.attr('isOur','true'); 
            }
            else
                $crudMenu
                    .append('<span data-target="' + this.$editModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
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
                                        (isOur)? _this.$editOurModal.fillWithData() : _this.$editModal.fillWithData();
                                        Materialize.updateTextFields();
                                        });
    }
}