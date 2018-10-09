class RoleModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', true, 500);
        
        this.formElements = [
            new InputTextField (this.id + 'nameTextField','Nazwa roli', undefined, true, 150),
            this.descriptionReachTextArea
        ];
        this.initialise();
    }
    
    fillWithData(){
        this.form.fillWithData([
            rolesRepository.currentItem.name,
            rolesRepository.currentItem.description
        ]);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> rolesRepository.addNewPerson
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
            this.dataObject.id = rolesRepository.currentItem.id, //używane tylko przy edycji
            this.dataObject.projectId = rolesRepository.parentItemId;
            rolesRepository.setCurrentItem(this.dataObject);
        }
    }
    
};