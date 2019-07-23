class MilestoneTemplateModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        
        this.formElements = [
            {   input: new InputTextField(this.id + 'nameTextField','Dopisek', undefined, false, 50),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
        //this.contractsAutoCompleteTextField.setDefaultItem();
        
        this.connectedResultsetComponent.connectedRepository.currentItem = { _parent: ContractTypesSetup.milestoneTypesRepository.currentItem
                                                                           };
    }
   /*
    onContractChosen(chosenItem){
        this.formElements[1].refreshDataSet();
    }
    */
};