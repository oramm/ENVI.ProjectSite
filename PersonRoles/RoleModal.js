class RoleModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);

        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', true, 500);
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField',
            'Imię i nazwisko',
            'person',
            true,
            'Wybierz imię i nazwisko');
        
        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa roli', undefined, true, 100),
                dataItemKeyName: 'name'
            },
            {
                input: this.personAutoCompleteTextField,
                dataItemKeyName: '_person',
                refreshDataSet() {
                    _this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
    
                }
            },
            {
                input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem =
        {
            projectOurId: MainSetup.currentProject.ourId,
            //contractId: MainSetup.currentContract.id,
            _group: this.connectedResultsetComponent.parentDataItem
        };
        this.personAutoCompleteTextField.setChosenItem(MainSetup.personsRepository.currentItem)
        this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
    }
};