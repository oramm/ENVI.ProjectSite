class CurrentMilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
   
        
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, true);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);     
        
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        
        this.formElements = [
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function (){    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(
                                                    item=> Array.isArray(item.contractType.match(new RegExp(MilestonesSetup.milestonesRepository.currentItem._parent.ourType+'|^$')))
                                                );
                                                this.input.initialise(currentMilestoneTypes, 'name');
                                            }
                                            
            },
            {   input: new InputTextField(this.id + 'nameTextField','Dopisek', undefined, false, 50),
                dataItemKeyName: 'name'
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
    initAddNewData(){}
   
};