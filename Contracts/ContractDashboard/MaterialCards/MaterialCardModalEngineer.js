class MaterialCardModalEngineer extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.engineersCommentReachTextArea = new ReachTextArea(this.id + '_engineersCommentReachTextArea', 'Uwagi Inżyniera', false, 1000);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField', 'Termin wykonania', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(MaterialCardsSetup.statusNames);

        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id + '_personAutoCompleteTextField',
            'Osoba odpowiedzialna',
            'person',
            true,
            'Wybierz imię i nazwisko');
        this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "nameSurnameEmail", this.onOwnerChosen, this);

        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {
                input: this.engineersCommentReachTextArea,
                dataItemKeyName: 'engineersComment'
            },
            {
                input: this.deadLinePicker,
                dataItemKeyName: 'deadline'
            },
            {
                input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            {
                input: this.personAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
        ];

        this.initialise();
    }

    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MaterialCardsSetup.milestonesRepository.items.filter((item => item._type.id == 7 &&
                item.contractId == MaterialCardsSetup.contractsRepository.currentItem.id
            ))[0],
            contractId: this.connectedResultsetComponent.connectedRepository.parentItemId

        };
        this.form.fillWithData({
            creationDate: Tools.dateJStoDMY(new Date())
        });
    }
}