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
        
        //this.roleSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        //this.roleSelectField.initialise();
        
        this.formElements = [
            {   input: this.personAutoCompleteTextField,
                dataItemKeyName: '_person'
            },
            {   input: this.roleSelectField,
                dataItemKeyName: '_role'
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
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    initAddNewData(){
    }    
};