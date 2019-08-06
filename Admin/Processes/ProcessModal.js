class ProcessModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.caseTypeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ sprawy', undefined, false);
        this.caseTypeSelectField.initialise(ProcessesSetup.caseTypesRepository.items, 'name');
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa procesu', undefined, true, 50),
                dataItemKeyName: 'name'
            },
            {   input: this.caseTypeSelectField,
                dataItemKeyName: '_caseType'
            },
            {   input: new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 500),
                dataItemKeyName: 'description'
            },
            {   input: new SwitchInput('Nieczynny','Aktywny'),
                dataItemKeyName: 'status'
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
        };
    }
};