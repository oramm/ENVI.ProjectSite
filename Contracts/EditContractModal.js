class EditContractModal extends ContractModal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> ContractsSetup.contractsRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        super.submitTrigger();
        if (this.form.validate(this.dataObject)){
            this.dataObject.id = ContractsSetup.contractsRepository.currentItem.id, //używane tylko przy edycji
            ContractsSetup.contractsRepository.setCurrentItem(this.dataObject);
            
            if(this.wasChanged(this.dataObject)){
                ContractsSetup.contractsRepository.editItem(ContractsSetup.contractsRepository.currentItem, this.connectedResultsetComponent);
            } else {
                alert("Taki wpis już jest w bazie!");
            }
        }
    }
    
    wasChanged(externalAchievement){
        var check = ContractsSetup.contractsRepository.items.find(item => Tools.areEqualObjects(externalAchievement,item))   
        return (check === undefined)? true : false;
    }
};