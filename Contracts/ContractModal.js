class ContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        var notOurTypes = ContractsSetup.contractTypesRepository.items.filter(item=>!item.isOur)
        this.typeSelectField = new SelectField(this.id + '_type_SelectField', 'Typ kontraktu', true);
        this.typeSelectField.initialise(notOurTypes, 'name');
        
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);
        
        this.ourIdRelatedSelectField = new SelectField(this.id + '_ourIdRelated_SelectField', 'Powiązana usługa IK lub PT', true);
        this.ourIdRelatedSelectField.initialise(this.makeOurPtIds(), '_ourIdName');
        this.statusSelectField = new SelectField(this.id + '_status_SelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.fidicTypeSelectField = new SelectField(this.id + '_fidicType_SelectField', 'FIDIC', true);
        this.fidicTypeSelectField.initialise(ContractsSetup.fidicTypes);
        
        this.formElements = [
            {   input: this.typeSelectField,
                dataItemKeyName: '_type'
            },
            {   input: new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa kontraktu', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.ourIdRelatedSelectField,
                dataItemKeyName: '_ourContract'
            },
            {   input: new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {   input: new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
                dataItemKeyName: 'endDate'
            },
            {   input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            {   input: this.commentReachTextArea,
                dataItemKeyName: 'comment'
            },
            {   input: this.fidicTypeSelectField,
                dataItemKeyName: 'fidicType'
            }
        ];
        this.initialise();
    }
    /*
     * Tworzy listę kontraktów typu IK PT dla danego projektu
     */
    makeOurPtIds(){
        var ourPtIkContracts = ContractsSetup.otherContractsRepository.items.filter(item=>item._ourType=='PT' || item._ourType=='IK');
        return ourPtIkContracts;
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            projectId: this.connectedResultsetComponent.connectedRepository.parentItemId
        };
    }
};