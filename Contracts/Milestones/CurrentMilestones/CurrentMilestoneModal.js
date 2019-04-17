class CurrentMilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
   
        
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, false);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);     
        
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        
        var _this=this;
        this.formElements = [
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function (){    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(
                                                    item=> this.checkContractType(item.contractType)
                                                );
                                                this.input.initialise(currentMilestoneTypes, 'name');
                                            },
                checkContractType: function(type){
                    var regExpr;
                    if(MilestonesSetup.milestonesRepository.currentItem._relatedContract.fidicType!=='Żółty')
                        regExpr = new RegExp(MilestonesSetup.milestonesRepository.currentItem._parent._ourType+'|^$' + '|' + MilestonesSetup.milestonesRepository.currentItem._relatedContract.fidicType);
                    else
                        regExpr = new RegExp(MilestonesSetup.milestonesRepository.currentItem._parent._ourType+'|^$' + '|Żółty|Czerwony');
                    
                    return Array.isArray(type.match(regExpr));
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