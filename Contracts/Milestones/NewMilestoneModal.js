class NewMilestoneModal extends MilestoneModal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.fillWithTestData();
        

    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> milestonesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        super.submitTrigger();
        if(this.isReallyNew(this.dataObject)){
            milestonesRepository.addNewItem(milestonesRepository.currentItem, this.connectedResultsetComponent);
        } else {
            alert("Taki wpis już jest w bazie");
        }
    }
    
    isReallyNew(externalAchievement){
        var isReallyNew = milestonesRepository.items.find( item => Tools.areEqualObjects(item, externalAchievement)
                                                      )   
        return (isReallyNew === undefined)? true : false;
    }
    
    fillWithTestData(){
        //this.formElements[0].children('input').val('nazwa testoWA');
        //tinyMCE.get(this.id + 'descriptionReachTextArea').setContent('OPIS TESOTWY');
        //tinyMCE.triggerSave();
        //this.startDatePicker.setChosenDate("2018-02-06");
        //this.endDatePicker.setChosenDate("2018-02-06");
        //this.statusSelectField.setChosenItem('Zrobione');
        
        
    }
};