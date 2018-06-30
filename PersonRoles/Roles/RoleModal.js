class RoleModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', true, 500);
        
        this.$formElements = [
            FormTools.createInputField(this.id + 'nameTextField','Nazwa roli', true, 150),
            this.descriptionReachTextArea.$dom,       
            FormTools.createSubmitButton("Przypisz")
        ];
        this.initialise();
        

    }fillWithData(){
        this.$formElements[0].children('input').val(rolesRepository.currentItem.name);

        tinyMCE.get(this.id + 'descriptionReachTextArea').setContent(rolesRepository.currentItem.description);
        tinyMCE.triggerSave();
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> rolesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { id: rolesRepository.currentItem.id, //używane tylko przy edycji
                            name: $('#'+this.id + 'nameTextField').val(),
                            description: $('#'+this.id + 'descriptionReachTextArea').val(),
                            projectId: rolesRepository.currentProjectId
                          };
        rolesRepository.setCurrentItem(this.dataObject);
    }
    
};