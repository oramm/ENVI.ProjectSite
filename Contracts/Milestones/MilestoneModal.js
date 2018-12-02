class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
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
            {   input: new InputTextField(this.id + 'nameTextField','Nazwa', undefined, true, 300),
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
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem.contractId = MilestonesSetup.milestonesRepository.currentItem.id;
        this.connectedResultsetComponent.connectedRepository.currentItem.projectId = MilestonesSetup.milestonesRepository.currentItem.projectId;
        this.connectedResultsetComponent.connectedRepository.currentItem.projectName = MilestonesSetup.milestonesRepository.currentItem.projectName;
    }
};