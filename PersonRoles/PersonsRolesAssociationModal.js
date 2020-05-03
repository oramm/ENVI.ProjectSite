class PersonsRolesAssociationModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.roleNames = []
        this.setRoleNames();

        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField',
            'Imię i nazwisko',
            'person',
            true,
            'Wybierz imię i nazwisko')
        this.personAutoCompleteTextField.initialise(PersonsSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);

        this.roleSelectField = new SelectFieldBrowserDefault(this.id + 'roleSelectField', 'Pełniona rola', true);
        this.roleSelectField.initialise(RolesSetup.rolesRepository.items);


        this.formElements = [
            {
                input: this.personAutoCompleteTextField,
                dataItemKeyName: '_person'
            },
            {
                input: this.roleSelectField,
                dataItemKeyName: '_role'
            }
        ];

        this.initialise();
    }
    /*
     * Potrzebne do zainicjowania Selecta
     */
    setRoleNames() {
        for (var i = 0; i < RolesSetup.rolesRepository.items.length; i++) {
            this.roleNames[i] = RolesSetup.rolesRepository.items[i].name;
        }
    }
    /*
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository = {
            projectOurId: this.connectedResultsetComponent.connectedRepository.parentItemId
        }
    }
};