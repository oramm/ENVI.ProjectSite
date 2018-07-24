class CaseModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.formElements = [
            new InputTextField (this.id + 'nameTextField','Nazwa sprawy', undefined, true, 150),
            new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300)
        ];
        this.initialise();
    }

    fillWithData(){
        this.form.fillWithData([
            casesRepository.currentItem.name,
            casesRepository.currentItem.description
        ]);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> casesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { name: '',
                            description: ''
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            this.dataObject.id = casesRepository.currentItem.id, //używane tylko przy edycji
            this.dataObject.milestoneId = casesRepository.parentItemId;
            casesRepository.setCurrentItem(this.dataObject);
        }
    }
    
};