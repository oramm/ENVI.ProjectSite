class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
   
        this.contractsAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                        'Dotyczy kontraktu', 
                                                                        'info', 
                                                                        false, 
                                                                        'Wybierz kontrakt')
        this.contractsAutoCompleteTextField.initialise(MilestonesSetup.otherContractsRepository,"_numberName", this.onContractChosen, this);
        
        
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, true);
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);     
        
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(MilestonesSetup.statusNames);
        var _this=this;
        this.formElements = [
            {   input: this.contractsAutoCompleteTextField,
                dataItemKeyName: '_relatedContract'
            },
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function (){    
                                    //if(_this.contractsAutoCompleteTextField.chosenItem){
                                        var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(
                                            item=> this.checkContractType(item.contractType)
                                        );
                                        this.input.initialise(currentMilestoneTypes, 'name');
                                        console.log('ContractsSetup.contractsRepository.currentItem.ourType:: ' + ContractsSetup.contractsRepository.currentItem._ourType);
                                    //}
                                },
                checkContractType: function(type){
                    var regExpr;
                    if (!_this.contractsAutoCompleteTextField.chosenItem)
                        regExpr = new RegExp(ContractsSetup.contractsRepository.currentItem._ourType+'|^$');
                    else if(_this.contractsAutoCompleteTextField.chosenItem.fidicType!=='Żółty')
                        regExpr = new RegExp(ContractsSetup.contractsRepository.currentItem._ourType+'|^$' + '|' + _this.contractsAutoCompleteTextField.chosenItem.fidicType);
                    else
                        regExpr = new RegExp(ContractsSetup.contractsRepository.currentItem._ourType+'|^$' + '|Żółty|Czerwony');
                    
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
    initAddNewData(){
        //this.contractsAutoCompleteTextField.setDefaultItem();
        
        this.connectedResultsetComponent.connectedRepository.currentItem = { _parent: ContractsSetup.contractsRepository.currentItem,
                                                                             _type: {name: ''}
                                                                           };
    }
   
    onContractChosen(chosenItem){
        this.formElements[1].refreshDataSet();
    }
};