class ContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);

        this.ourIdConnectedSelectField = new SelectField(this.id + '_ourIdConnected_SelectField', 'Powiązana usługa IK lub PT', true);
        this.ourIdConnectedSelectField.initialise(this.makeOurPtIds());
        this.statusSelectField = new SelectField(this.id + '_status_SelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.fidicTypeSelectField = new SelectField(this.id + '_fidicType_SelectField', 'FIDIC', true);
        this.fidicTypeSelectField.initialise(ContractsSetup.fidicTypes);
        
        this.formElements = [
            new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
            new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
            this.ourIdConnectedSelectField,
            new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
            new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
            this.statusSelectField,
            this.commentReachTextArea,
            this.fidicTypeSelectField
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
    fillWithData(){
        this.form.fillWithData([
            ContractsSetup.contractsRepository.currentItem.number,
            ContractsSetup.contractsRepository.currentItem.name,
            ContractsSetup.contractsRepository.currentItem.ourIdConnected,
            ContractsSetup.contractsRepository.currentItem.startDate,
            ContractsSetup.contractsRepository.currentItem.endDate,
            ContractsSetup.contractsRepository.currentItem.status,
            ContractsSetup.contractsRepository.currentItem.comment,
            ContractsSetup.contractsRepository.currentItem.fidicType
        ]);
    }
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> ContractsSetup.contractsRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { number: '',
                            name: '',
                            ourIdConnected: '',
                            startDate: '',
                            endDate: '',
                            status: '',
                            comment: '',
                            fidicType: '',
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            
            this.dataObject.projectId = ContractsSetup.contractsRepository.parentItemId;
        }
    }    
};