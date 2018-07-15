class CaseModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300);
        this.$formElements = [
            FormTools.createInputField(this.id + 'nameTextField','Nazwa sprawy', true, 150),
            this.descriptionReachTextArea.$dom,
            FormTools.createSubmitButton("Przypisz")
        ];
        this.initialise();
    }

    fillWithData(){
        this.$formElements[0].children('input').val(casesRepository.currentItem.name);
        tinyMCE.get(this.id + 'descriptionReachTextArea').setContent(casesRepository.currentItem.description);
        tinyMCE.triggerSave();
        Materialize.updateTextFields();
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> casesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { id: casesRepository.currentItem.id, //używane tylko przy edycji
                            name: $('#'+this.id + 'nameTextField').val(),
                            description: $('#'+this.id + 'descriptionReachTextArea').val(),
                            milestoneId: casesRepository.parentItemId
                          };
        casesRepository.setCurrentItem(this.dataObject);
    }
    
};