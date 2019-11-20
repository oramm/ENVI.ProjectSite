class CaseTypeModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + '_descriptionReachTextArea','Opis', false, 500);
        
        this.formElements = [
            {   input: new InputTextField(this.id + '_nameTextField','Nazwa typu sprawy', undefined, false, 50),
                dataItemKeyName: 'name'
            },
            {   input: new InputTextField(this.id + 'folderNumberTextField','Numer folderu GD', undefined, true, 5),
                dataItemKeyName: 'folderNumber'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new SwitchInput('','Ustaw jako domyślny'),
                dataItemKeyName: 'isDefault'
            },
            {   input: new SwitchInput('','Ustaw jako domyślny w scrumboardzie'),
                dataItemKeyName: 'isInScrumByDefault'
            },
            {   input: new SwitchInput('','Unikalny dla kamienia milowego'),
                dataItemKeyName: 'isUniquePerMilestone'
            }
            
        ];
        this.initialise();
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = { _milestoneType: CaseTypesSetup.currentMilestoneType,
                                                                             _processes: []
                                                                           };
    }
};