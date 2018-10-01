class NewOurContractModal extends OurContractModal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.fillWithInitData();        
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
            ContractsSetup.contractsRepository.setCurrentItem(this.dataObject);
            
            if(this.isReallyNew(this.dataObject)){
                ContractsSetup.contractsRepository.addNewItem(ContractsSetup.contractsRepository.currentItem, this.connectedResultsetComponent);
            } else {
                alert("Taki wpis już jest w bazie");
            }
        }
    }
    
    isReallyNew(externalAchievement){
        var isReallyNew = ContractsSetup.contractsRepository.items.find( item => Tools.areEqualObjects(item, externalAchievement)
                                                      )   
        return (isReallyNew === undefined)? true : false;
    }
    
    fillWithInitData(){
        //this.formElements[0].$dom.children('input').val('nazwa testoWA');
        //tinyMCE.get(this.id + 'descriptionReachTextArea').setContent('OPIS TESOTWY');
        //tinyMCE.triggerSave();
        //this.startDatePicker.setChosenDate("2018-02-06");
        //this.endDatePicker.setChosenDate("2018-02-06");
        //this.statusSelectField.setChosenItem(this.connectedResultsetComponent.status); 
    }
};