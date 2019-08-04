class ContractTypeModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 300);

        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa typu kontraktu', undefined, true, 10),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new SwitchInput('','Umowa ENVI'),
                dataItemKeyName: 'isOur'
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