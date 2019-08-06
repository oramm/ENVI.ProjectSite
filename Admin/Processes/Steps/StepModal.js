class StepModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, true);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        
        this.formElements = [
            {   input: new InputTextField(this.id + 'nameTextField','Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new InputTextField(this.id + 'DocumentTemplateIdTextField','Google Drive ID pliku szablonu', undefined, false, 50),
                dataItemKeyName: 'documentTemplateId'
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
            _parent: ProcessesSetup.processesRepository.currentItem
        };
        
    }
};