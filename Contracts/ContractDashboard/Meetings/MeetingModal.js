class MeetingModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        
        this.formElements = [
            {   input: new DatePicker(this.id + 'datePickerField','Data spotkania', true),
                dataItemKeyName: 'date'
            },
            {   input: new InputTextField (this.id + 'locationTextField','Tytuł', undefined, true, 50),
                dataItemKeyName: 'location'
            },
            {   input: new InputTextField (this.id + 'nameTextField','Tytuł', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 500),
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }

    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
                _project: MeetingsSetup.currentProject
            };
    }
};