class ContractModalController {
    constructor(modal){
        this.modal = modal;
        this._this = this;
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler(){
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            projectId: this.modal.connectedResultsetComponent.connectedRepository.parentItemId
        };
    }
    
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    contractorsChipsRefreshDataSet(){
        this.modal.selectedContractorsHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode=='ADD_NEW')
            this.modal.selectedContractorsHiddenInput.value = [];
        if (this.modal.mode=='EDIT') {
            this.modal.selectedContractorsHiddenInput.value = ContractsSetup.contractsRepository.currentItem._contractors;
            for (var i=0; i<this.modal.selectedContractorsHiddenInput.value.length; i++){
                this.appendContractorChip(this.modal.selectedContractorsHiddenInput.value[i]);
            }
        }
    }
    
    contractorSelectFieldInitialize(){
        this.modal.contractorAutoCompleteTextField.clearChosenItem();
    }
    
    checkContractor(contractorItem){
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedContractorsHiddenInput.value.map(existingContractorItem=>{
                if (existingContractorItem.id==contractorItem.id)
                        allowType = false;
            });
        return allowType;//contractorTypeItem.milestoneTypeId==ContractorsSetup.currentMilestone._type.id;
    }
    onContractorChosen(chosenItem){
        this.addContractorItem(chosenItem);
        this.contractorSelectFieldInitialize(chosenItem);
    }
    
    addContractorItem(contractorDataItem){
        this.modal.selectedContractorsHiddenInput.value.push(contractorDataItem);
        this.appendContractorChip(contractorDataItem);
    }

    appendContractorChip(contractorDataItem){
        var chipLabel = contractorDataItem.name;
        this.modal.selectedContractorsHiddenInput.$dom.parent()
                .prepend(new Chip(  'contractor_', 
                                    chipLabel,
                                    contractorDataItem,
                                    this.onContractorUnchosen,
                                    this).$dom);

    }
    onContractorUnchosen(unchosenItem){
        //LettersSetup.contractorsRepository.deleteFromCurrentItems(unchosenItem);
        this.removeContractorItem(unchosenItem);
    }
                
    //usuwa contractorItem z listy HiddenInput.value[]
    removeContractorItem(contractorDataItem){
        var index = Tools.arrGetIndexOf(this.modal.selectedContractorsHiddenInput.value, 'id', contractorDataItem.id); 
        this.modal.selectedContractorsHiddenInput.value.splice(index, 1);
    }
};