class PersonRolesAssociationsModal extends Modal {
    constructor(id, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super();
        this.initialise(id, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
        this.setTittle("Przypisz role dla Projektu " + rolesRepository.selectedProjectId);
        var optionsRadioButtons = FormTools.createRadioButtons("roleId", rolesRepository);
        this.appendUiElement(optionsRadioButtons[0].outerHTML)
            .then(  $('[name^="roleId"]').click(function() {
                    rolesRepository.selectedItemId = $(this).val();
                    })
                 );
        var personTextField = FormTools.createAutoCompleteTextField();
        this.appendUiElement(personTextField[0].outerHTML);
        var autocomplete = new AutoComplete(personsRepository,"email", this.onProjectChosen, this);

        var submitButton = FormTools.createSubmitButton("Przypisz");
        this.appendUiElement(submitButton[0].outerHTML);
        //this.associationsModal = new Modal('associationsModal',this, this.addNewAssociationTrigger);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> rolesRepository.addNewPersonRoleAssociation
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        rolesRepository.newPersonRoleAssociated();
        var association = rolesRepository.newPersonRoleAssociation;
        var isReallyNew = !$('#' + association.id).length; 
        if(isReallyNew){
            rolesRepository.addNewPersonRoleAssociation(association, this.connectedResultsetComponent);
        } else {
            alert("Wybrana rola już została wcześniej przypisana!");
        }
    }
};