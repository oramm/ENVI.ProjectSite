class PersonsRolesAssociationModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        this.roleNames=[]
        this.setRoleNames();
        
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                     'Imię i nazwisko', 
                                                                     'person', 
                                                                     true, 
                                                                     'Wybierz imię i nazwisko')
        this.personAutoCompleteTextField.initialise(personsRepository,"nameSurnameEmail", this.onOwnerChosen, this);
        this.roleSelectField = new SelectFieldBrowserDefault(this.id + 'roleSelectField', 'Pełniona rola', true);
        this.roleSelectField.initialise(rolesRepository.items);
        
        
        this.formElements = [
            {   input: this.personAutoCompleteTextField,
                dataItemKeyName: 'person'
            },
            {   input: this.roleSelectField,
                dataItemKeyName: 'role'
            }
        ];
        
        this.initialise();
    }
    /*
     * Potrzebne do zainicjowania Selecta
     */
    setRoleNames(){
        for (var i=0; i<rolesRepository.items.length; i++){
            this.roleNames[i] = rolesRepository.items[i].name;
        }
    }
    /*
     * Wypełnia formularz - używane przy edycji
     */
    fillWithData1(){
        this.personAutoCompleteTextField.setChosenItem(personRoleAssociationsRepository.currentItem.personNameSurnameEmail);
        this.roleSelectField.simulateChosenItem(personRoleAssociationsRepository.currentItem.roleName);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> rolesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger1(){
        this.dataObject = { id: personRoleAssociationsRepository.currentItem.id, //używane tylko przy edycji
                            personId: this.personAutoCompleteTextField.chosenItem.id,
                            roleId:  this.roleSelectField.chosenItem.id,
                            roleName:  this.roleSelectField.chosenItem.name
                          };
        personRoleAssociationsRepository.setCurrentItem(this.dataObject);
    }
    /*
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    initAddNewData(){
    }    
};