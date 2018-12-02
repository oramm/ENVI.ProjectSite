class ContractsCollapsible extends SimpleCollapsible {
    constructor(id, connectedRepository){
        super(id, 'Kontrakty', connectedRepository);
        
        this.$addNewModal = new ContractModal(id + '_newContract', 'Dodaj kontrakt', this, 'ADD_NEW');
        this.editModal = new ContractModal(id + '_editContract', 'Edytuj kontrakt', this, 'EDIT');
        this.$addNewOurModal = new OurContractModal(id + '_newOurContract', 'Rejestruj umowę ENVI', this, 'ADD_NEW');
        this.editOurModal = new OurContractModal(id + '_editOurContract', 'Edytuj umowę ENVI', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
        this.$addNewOurModal.preppendTriggerButtonTo(this.$actionsMenu,"Rejestruj umowę ENVI");
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        this.connectedRepository.currentItem.projectId = this.connectedRepository.projectId;
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
        //przy dodawaniu i edycji dane nie są jeszcze zapisane w connectedRepository.items, ale w SimmpleRepository ustawiona jest currentItem
        if (!contract) contract = ContractsSetup.contractsRepository.currentItem;
        if (this.isDeletable || this.isEditable){
            var $crudMenu = $row.find('.collapsible-header > .crudButtons');
            if (contract.ourId){ 
                $crudMenu
                    .append('<span data-target="' + this.editOurModal.id + '" class="collapsibleItemEdit modal-trigger"><i class="material-icons">edit</i></span>');
            $row.attr('isOur','true'); 
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
                                        (isOur)? _this.editOurModal.fillWithData() : _this.editModal.fillWithData();
                                        Materialize.updateTextFields();
                                        });
    }
    /*
     * Przeciążenie konieczne bo przy dodawaniu nowych milestonów muszą być ustawione
     * dane bieżącego kontraktu i projektu
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //milestonesRepository.currentItem.contractId = this.connectedRepository.currentItem.id;
        //milestonesRepository.currentItem.projectName = this.connectedRepository.currentItem.projectName;
    }
}