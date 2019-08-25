class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        /*
        this.contractsAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                        'Dotyczy kontraktu', 
                                                                        'info', 
                                                                        false, 
                                                                        'Wybierz kontrakt')
        this.contractsAutoCompleteTextField.initialise(ContractsSetup.otherContractsRepository,"_numberName", this.onContractChosen, this);       
        */
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', this.onTypeChosen, true);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);     
        
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        //var _this=this;
        this.formElements = [
            //{   input: this.contractsAutoCompleteTextField,
            //    dataItemKeyName: '_relatedContract'
            //},
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function (){
                    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(
                        item=> item._contractType.id == ContractsSetup.contractsRepository.currentItem.typeId
                    );
                    
                    this.input.initialise(currentMilestoneTypes, '_folderNumber_MilestoneTypeName');
                }                                      
            },
            {   input: new InputTextField(this.id + 'nameTextField','Dopisek', undefined, false, 50),
                dataItemKeyName: 'name',
                refreshDataSet: function (){ 
                    if(MilestonesSetup.milestonesRepository.currentItem._type && 
                       MilestonesSetup.milestonesRepository.currentItem._type.isUniquePerContract ||
                       MilestonesSetup.milestoneTypesRepository.currentItem.isUniquePerContract){
                        this.input.$dom.hide();
                    } else
                        this.input.$dom.show();
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
        //this.contractsAutoCompleteTextField.setDefaultItem();
        
        this.connectedResultsetComponent.connectedRepository.currentItem = { _parent: ContractsSetup.contractsRepository.currentItem,
                                                                             _type: {name: ''}
                                                                           };
    }
   
    onTypeChosen(chosenItem){
        this.formElements[1].refreshDataSet();
    }
};