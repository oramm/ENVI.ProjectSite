class ContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);

        this.ourIdConnectedSelectField = new SelectField(this.id + '_ourIdConnected_SelectField', 'Powiązana usługa IK lub PT', true);
        this.ourIdConnectedSelectField.initialise(this.makeOurPtIds());
        this.statusSelectField = new SelectField(this.id + '_status_SelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.fidicTypeSelectField = new SelectField(this.id + '_fidicType_SelectField', 'FIDIC', true);
        this.fidicTypeSelectField.initialise(ContractsSetup.fidicTypes);
        
        this.formElements = [
            {   input: new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {   input: new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.ourIdConnectedSelectField,
                dataItemKeyName: 'ourId'
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
    makeOurPtIds(){
        var ourPtIkContracts = ContractsSetup.contractsRepository.items.filter(item=>item.ourType=='PT' || item.ourType=='IK')
        var ourPtIkIds = [];
        for (var i=0; i<ourPtIkContracts.length; i++){
            ourPtIkIds.push(ourPtIkContracts[i].ourId + ' ' + ourPtIkContracts[i].name.substr(0,50) + '...')
        }
        return ourPtIkIds;
    } 
};