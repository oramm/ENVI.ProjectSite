class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);
        
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Rodzaj sprawy', true);
        
        
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        
        this.formElements = [
            {   input: new InputTextField(this.id + 'nameTextField','Nazwa', undefined, true, 300),
                dataItemKeyName: 'name'
            },
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function (){    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(
                                                    item=>{ 
                                                            return Array.isArray(item.ourContractType.match(/ContractsSetup.contractsRepository.currentItem.ourType|^$/))
                                                          }
                                                );
                                                this.input.initialise(currentMilestoneTypes, 'name');
                                            }
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: this.startDatePicker,
                dataItemKeyName: 'startDate'
            },
            {   input: this.endDatePicker,
                dataItemKeyName: 'endDate'
            },
            {   input: this.statusSelectField,
                dataItemKeyName: 'status'
            }
        ];
        this.initialise();
    }
    
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = { _parent: ContractsSetup.contractsRepository.currentItem                                                                   };
    }
   
};