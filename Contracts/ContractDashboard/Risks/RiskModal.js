class RiskModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);      
        
        this.milestonesSelectField = new SelectField(this.id + '_milestonesSelectField', 'Kamień milowy', undefined, true);
        this.milestonesSelectField.initialise(RisksSetup.milestonesRepository.items.filter(
                                                    item=>item.contractId == RisksSetup.contractsRepository.currentItem.id
                                               ),'_FolderNumber_TypeName_Name');
        this.milestonesSelectField.$select.on('change',()=> this.onMilestoneChosen(this.milestonesSelectField.getChosenItem()));
        
        this.caseSelectField = new SelectField(this.id + 'caseSelectField', 'Sprawa', undefined, true);
        
        //var casesTypes = (CasesSetup.caseTypesRepository.items.length>0)? CasesSetup.caseTypesRepository.items : []
        this.caseSelectField.initialise(RisksSetup.casesRepository.items, 'name');
        

        this.probabilitySelectField = new SelectField(this.id + '_probabilitySelectField', 'Prawdopodobieństwo', true);
        this.probabilitySelectField.initialise(RisksSetup.probabilityRates);
        
        this.overallImpactSelectField = new SelectField(this.id + '_overallImpactSelectField', 'Wpływ na projekt', true);
        this.overallImpactSelectField.initialise(RisksSetup.overallImpactRates);
        this.formElements = [
            {   input: this.milestonesSelectField,
                dataItemKeyName: '_parent',
            },
            {   input: this.caseSelectField,
                dataItemKeyName: '_case'                                     
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
    
    onMilestoneChosen(inputValue){
        RisksSetup.milestonesRepository.currentItem = inputValue;
            
        var currentCases = RisksSetup.casesRepository.items.filter(
                item=>item._parent.id == inputValue.id
            );
            
        //var currentMilestonesNames = currentMilestones.map(item=>item.name);
        this.caseSelectField.initialise(currentCases, '_typeFolderNumber_TypeName_Number_Name');
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = {
                projectId: RisksSetup.contractsRepository.parentItemId
            }
    }
}