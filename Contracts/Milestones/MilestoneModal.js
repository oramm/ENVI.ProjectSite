class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.statusNames = [    'Nie rozpoczęty',
                                'W trakcie',
                                'Zrobione',
                                'Opóźnione!',
                                'Termin aneksowany'
                            ];
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 500);
        this.startDatePicker = new DatePicker(this.id + 'startDatePickerField','Początek', true);
        this.endDatePicker = new DatePicker(this.id + 'endDatePickerField','Koniec', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(this.statusNames);
        this.formElements = [
            new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
            this.descriptionReachTextArea,
            this.startDatePicker,
            this.endDatePicker,
            this.statusSelectField
        ];
        this.initialise();
    }

    fillWithData(){
        this.form.fillWithData([
            milestonesRepository.currentItem.name,
            milestonesRepository.currentItem.description,
            milestonesRepository.currentItem.startDate,
            milestonesRepository.currentItem.endDate,
            milestonesRepository.currentItem.status
        ]);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> milestonesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        
        this.dataObject = { name: '',
                            description: '',
                            startDate: '',
                            endDate: '',
                            status: ''
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            this.dataObject.id = milestonesRepository.currentItem.id, //używane tylko przy edycji
            this.dataObject.contractId = contractsRepository.currentItem.id;
            this.dataObject.projectId = contractsRepository.currentItem.projectId;
            milestonesRepository.setCurrentItem(this.dataObject);
        }
        
    }
};