class ContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);
        
        this.statusSelectField = new SelectField(this.id + '_statusSelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.formElements = [
            new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
            new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
            new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
            new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
            this.statusSelectField,
            this.commentReachTextArea
        ];
        this.initialise();
    }

    fillWithData(){
        this.form.fillWithData([
            ContractsSetup.contractsRepository.currentItem.number,
            ContractsSetup.contractsRepository.currentItem.name,
            ContractsSetup.contractsRepository.currentItem.startDate,
            ContractsSetup.contractsRepository.currentItem.endDate,
            ContractsSetup.contractsRepository.currentItem.status,
            ContractsSetup.contractsRepository.currentItem.comment
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
                            startDate: '',
                            endDate: '',
                            status: '',
                            comment: ''
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            
            this.dataObject.projectId = ContractsSetup.contractsRepository.parentItemId;
            
        }
    }    
};