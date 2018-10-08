class OurContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);
        
        this.statusSelectField = new SelectField(this.id + '_statusSelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.managerAutoCompleteTextField = new AutoCompleteTextField(this.id+'_managerAutoCompleteTextField',
                                                                     'Koordynator', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.managerAutoCompleteTextField.initialise(ContractsSetup.personsRepository,"nameSurnameEmail", this.onManagerChosen, this);
        this.adminAutoCompleteTextField = new AutoCompleteTextField(this.id+'_adminAutoCompleteTextField',
                                                                     'Administrator', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.adminAutoCompleteTextField.initialise(ContractsSetup.personsRepository,"nameSurnameEmail", this.onAdminChosen, this);
        this.formElements = [
            new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
            new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
            new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
            new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
            new InputTextField (this.id + 'valueTextField','Wartość umowy', undefined, true, 20),
            this.statusSelectField,
            this.commentReachTextArea,
            new InputTextField (this.id + 'ourIdTextField','Oznaczenie zlecenia ENVI', undefined, true, 150),
            this.managerAutoCompleteTextField,
            this.adminAutoCompleteTextField
        ];
        this.initialise();
    }

    fillWithData(){
        this.form.fillWithData([
            ContractsSetup.contractsRepository.currentItem.number,
            ContractsSetup.contractsRepository.currentItem.name,
            ContractsSetup.contractsRepository.currentItem.startDate,
            ContractsSetup.contractsRepository.currentItem.endDate,
            ContractsSetup.contractsRepository.currentItem.value,
            ContractsSetup.contractsRepository.currentItem.status,
            ContractsSetup.contractsRepository.currentItem.comment,
            ContractsSetup.contractsRepository.currentItem.ourId,
            ContractsSetup.contractsRepository.currentItem.managerNameSurnameEmail,
            ContractsSetup.contractsRepository.currentItem.adminNameSurnameEmail
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
                            value: '',
                            status: '',
                            comment: '',
                            ourId: '',
                            chosenManager: '',
                            chosenAdmin: ''
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            
            this.dataObject.projectId = ContractsSetup.contractsRepository.parentItemId;
            this.dataObject.isOur = true;
            this.dataObject.managerNameSurnameEmail = this.dataObject.chosenManager.nameSurnameEmail;
            this.dataObject.managerId = this.dataObject.chosenManager.id;
            this.dataObject.adminNameSurnameEmail = this.dataObject.chosenAdmin.nameSurnameEmail;
            this.dataObject.adminId = this.dataObject.chosenAdmin.id;
            
        }
    }    
};