class RiskModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);
        
        this.contractsAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                     'Numer  i nazwa kontraktu', 
                                                                     'info', 
                                                                     true, 
                                                                     'Wybierz kontrakt')
        this.contractsAutoCompleteTextField.initialise(RisksSetup.contractsRepository,"ourIdNumberName", this.onContractChosen, this);
        
        this.milestonesSelectField = new SelectField(this.id + '_milestonesSelectField', 'Kamień milowy', undefined, true);
        
        this.probabilitySelectField = new SelectField(this.id + '_probabilitySelectField', 'Prawdopodobieństwo', true);
        this.probabilitySelectField.initialise(RisksSetup.probabilityRates);
        
        this.overallImpactSelectField = new SelectField(this.id + '_overallImpactSelectField', 'Wpływ na projekt', true);
        this.overallImpactSelectField.initialise(RisksSetup.overallImpactRates);
        
        this.formElements = [
            {   input: this.contractsAutoCompleteTextField,
                dataItemKeyName: '_contract'
            },
            {   input: this.milestonesSelectField,
                dataItemKeyName: '_milestone'
            },
            {   input: new InputTextField (this.id + '_nameTextField','Nazwa', undefined, true, 250),
                dataItemKeyName: 'name'
            },
            {   input: new ReachTextArea (this.id + '_causeReachTextArea','Przyczyna', false, 500),
                dataItemKeyName: 'cause'
            },
            {   input: new ReachTextArea (this.id + '_scheduleImpactDescriptionReachTextArea','Wpływ na harmonogram', false, 500),
                dataItemKeyName: 'scheduleImpactDescription'
            },
            {   input: new ReachTextArea (this.id + '_costImpactDescriptionReachTextArea','Wpływ na koszt', false, 500),
                dataItemKeyName: 'costImpactDescription'
            },
            {   input: this.probabilitySelectField,
                dataItemKeyName: 'probability'
            },
            {   input: this.overallImpactSelectField,
                dataItemKeyName: 'overallImpact'
            },
            {   input: new ReachTextArea (this.id + '_additionalActionsDescriptionReachTextArea','Działania dodatkowe', false, 500),
                dataItemKeyName: 'additionalActionsDescription'
            }
        ];
        
        this.initialise();
    }
    
    onContractChosen(inputValue){
        RisksSetup.contractsRepository.currentItem = inputValue;
            
        var currentMilestones = RisksSetup.milestonesRepository.items.filter(
                item=>item.contractId == inputValue.id
            );
            
        //var currentMilestonesNames = currentMilestones.map(item=>item.name);
        this.milestonesSelectField.initialise(currentMilestones, 'name');
    }
}