class RoleModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
             
        this.$formElements = [
            FormTools.createInputField(this.id + 'nameTextField','Nazwa roli', true, 150),
            //FormTools.createInputField(this.id + 'descriptionTextField','Opis', true, 500),
            //(id, label, isRequired, maxCharacters, dataError)
            FormTools.createTextArea(this.id + 'descriptionTextField','Opis', false, 700), 
            
            FormTools.createSubmitButton("Przypisz")
        ];
        this.initialise();
        

    }
    fillWithData(){
        this.$formElements[0].children('input').val(rolesRepository.currentItem.name);
        this.$formElements[1].children('textarea').val(rolesRepository.currentItem.description);
        //this.$formElements[1].children('input').trigger('autoresize');//do przetestowania
        tinyMCE.get(this.id + 'descriptionTextField').setContent(rolesRepository.currentItem.description);
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
                            description: $('#'+this.id + 'descriptionTextField').val(),
                            projectId: rolesRepository.currentProjectId
                          };
        rolesRepository.setCurrentItem(this.dataObject);
    }
    
};