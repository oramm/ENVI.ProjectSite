class MilestoneTypeModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode){
        super(id, title, connectedResultsetComponent, mode);

        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        
        this.formElements = [
            {   input: new InputTextField(this.id + 'nameTextField','Nazwa typu kamienia', undefined, false, 50),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new SwitchInput('','Ustaw jako domyślny w scrumboardzie'),
                dataItemKeyName: 'isInScrumByDefault'
            },
            {   input: new SwitchInput('','Unikalny w kontrakcie'),
                dataItemKeyName: 'isUniquePerContract'
            }
            
        ];
        this.initialise();
    }
    
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
    }
};