class MaterialCardModalEmployer extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);
        this.employersCommentReachTextArea = new ReachTextArea (this.id + '_employersCommentReachTextArea','Uwagi Zamawiającego', false, 500);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField','Termin wykonania', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(MaterialCardsSetup.statusNames);
        
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id+'_personAutoCompleteTextField',
                                                                     'Osoba odpowiedzialna', 
                                                                     'person', 
                                                                     true, 
                                                                     'Wybierz imię i nazwisko');
        this.personAutoCompleteTextField.initialise(personsRepository,"nameSurnameEmail", this.onOwnerChosen, this);
        
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.employersCommentReachTextArea,
                dataItemKeyName: 'employersComment'
            },
            {   input: this.deadLinePicker,
                dataItemKeyName: 'deadline'
            },
            {   input: this.statusSelectField,
                dataItemKeyName: 'status'
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

    }
}