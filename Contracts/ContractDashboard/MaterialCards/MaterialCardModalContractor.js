class MaterialCardModalContractor extends Modal {
    constructor(id, title, connectedResultsetComponent, mode){
        super(id, title, connectedResultsetComponent,mode);
        this.datePicker = new DatePicker(this.id + 'datePickerField','Data zgłoszenia', true);
        this.descriptionReachTextArea = new ReachTextArea (this.id + '_descriptionReachTextArea','Opis', false, 1000);
        this.contractorsDescriptionReachTextArea = new ReachTextArea (this.id + '_contractorsdescriptionReachTextArea','Opis', false, 1000);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField','Termin wykonania', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(MaterialCardsSetup.statusNames);
        
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id+'_personAutoCompleteTextField',
                                                                     'Osoba odpowiedzialna', 
                                                                     'person', 
                                                                     true, 
                                                                     'Wybierz imię i nazwisko');
        this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository,"_nameSurnameEmail", this.onOwnerChosen, this);
        
        this.formElements = [
            {   input: this.datePicker,
                dataItemKeyName: 'creationDate'
            },
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
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
        this.connectedResultsetComponent.connectedRepository.currentItem = {    
            _contract:  MaterialCardsSetup.contractsRepository.currentItem,  
            contractId: this.connectedResultsetComponent.connectedRepository.parentItemId,
            _versions: [],
            _editor: {
                name: MainSetup.currentUser.name,
                surname: MainSetup.currentUser.surname,
                systemEmail: MainSetup.currentUser.systemEmail
            },
            _lastUpdated: ''
            };
        this.form.fillWithData({ creationDate: Tools.dateJStoDMY(new Date())
                               });
    }
}