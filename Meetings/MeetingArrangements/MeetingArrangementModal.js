class MeetingArrangementModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
          
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        
        this.ownerAutoCompleteTextField = new AutoCompleteTextField(this.id+'_ownerAutoCompleteTextField',
                                                                     'Osoba odpowiedzialna', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.ownerAutoCompleteTextField.initialise(MeetingsSetup.personsRepository,"nameSurnameEmail", undefined, this);
        
        this.formElements = [
            {   input: new InputTextField(this.id + 'nameTextField','Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new DatePicker(this.id + 'deadlinePickerField','Termin wykonania', true),
                dataItemKeyName: 'deadline'
            },
            {   input: this.ownerAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
            
        ];
        this.initialise();
    }
    
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
        //zainicjuj dane kontekstowe
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MeetingsSetup.meetingsRepository.currentItem,
            _case: MeetingsSetup.casesRepository.currentItem
        };
        
    }
};