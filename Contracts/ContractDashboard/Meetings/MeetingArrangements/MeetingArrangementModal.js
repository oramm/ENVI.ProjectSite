class MeetingArrangementModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);

        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', false, 500);

        this.ownerAutoCompleteTextField = new AutoCompleteTextField(this.id + '_ownerAutoCompleteTextField',
            'Osoba odpowiedzialna',
            'person',
            false,
            'Wybierz imię i nazwisko')
        this.ownerAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, 'nameSurnameEmail', undefined, this);
        this.caseCollapsibleSelect = new CollapsibleSelect(this.id + "_casesCollapsibleSelect", 'Wybierz sprawę', new MilestonesCollapsible(this.id + '_milestonesCollapsible'), true)

        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {
                input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {
                input: this.caseCollapsibleSelect,
                dataItemKeyName: '_case'
            },
            {
                input: new DatePicker(this.id + 'deadlinePickerField', 'Termin wykonania', true),
                dataItemKeyName: 'deadline'
            },
            {
                input: this.ownerAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }

        ];
        this.initialise();
    }

    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        //zainicjuj dane kontekstowe
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MeetingsSetup.meetingsRepository.currentItem,
            _case: MeetingsSetup.casesRepository.currentItem
        };

    }
};