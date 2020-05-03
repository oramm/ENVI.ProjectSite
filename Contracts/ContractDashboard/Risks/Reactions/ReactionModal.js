class ReactionModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField','Termin wykonania', true);
        //this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        //this.statusSelectField.initialise(ReactionsSetup.statusNames);
        
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                     'Imię i nazwisko', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository,"_nameSurnameEmail", this.onOwnerChosen, this);
        
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa zadania', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: this.deadLinePicker,
                dataItemKeyName: 'deadline'
            },
            {   input: this.personAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
        ];
        this.initialise();
    }

    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){        
        this.connectedResultsetComponent.connectedRepository.currentItem = { 
                status: 'Backlog',
                _parent: RisksSetup.risksRepository.currentItem._case 
            };
    }
};