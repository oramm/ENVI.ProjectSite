/*
 * TODO w przyszłości
 */
class MilestoneModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
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
        this.$formElements = [
            FormTools.createInputField(this.id + 'nameTextField','Nazwa', true, 150),
            this.descriptionReachTextArea.$dom,
            this.startDatePicker.$dom,
            this.endDatePicker.$dom,
            this.statusSelectField.$dom,
            FormTools.createSubmitButton("Przypisz")
        ];
        this.initialise();
        

    }

    fillWithData(){
        this.$formElements[0].children('input').val(milestonesRepository.currentItem.name);
        tinyMCE.get(this.id + 'descriptionReachTextArea').setContent(milestonesRepository.currentItem.description);
        tinyMCE.triggerSave();
        this.startDatePicker.setChosenDate(milestonesRepository.currentItem.startDate);
        this.endDatePicker.setChosenDate(milestonesRepository.currentItem.endDate);
        this.statusSelectField.setChosenItem(milestonesRepository.currentItem.status);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> milestonesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { id: milestonesRepository.currentItem.id, //używane tylko przy edycji
                            name: $('#'+this.id + 'nameTextField').val(),
                            description: $('#'+this.id + 'descriptionReachTextArea').val(),
                            startDate: $('#' + this.id + 'startDatePickerField').val(),
                            endDate: $('#' + this.id + 'endDatePickerField').val(),
                            status: this.$formElements[4].find('input').val(),
                            contractId: contractsRepository.currentItem.id,
                            projectId: contractsRepository.currentItem.projectId
                          };
        milestonesRepository.setCurrentItem(this.dataObject);
    }
    
};