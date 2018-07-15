/*
 * TODO w przyszłości
 */
class TaskModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler){
        super(id, tittle, connectedResultsetComponent, connectedResultsetComponentAddNewHandler);
        this.statusNames = [    'Nie rozpoczęty',
                                'W trakcie',
                                'Zrobione',
                                'Opóźnione!',
                                'Termin aneksowany'
                            ];
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField','Termin wykonania', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(this.statusNames);
        this.$formElements = [
            FormTools.createInputField(this.id + 'nameTextField','Nazwa zadania', true, 150),
            this.descriptionReachTextArea.$dom,
            this.deadLinePicker.$dom,
            this.statusSelectField.$dom,
            FormTools.createSubmitButton("Przypisz")
        ];
        this.initialise();
        

    }

    fillWithData(){
        this.$formElements[0].children('input').val(tasksRepository.currentItem.name);
        tinyMCE.get(this.id + 'descriptionReachTextArea').setContent(tasksRepository.currentItem.description);
        tinyMCE.triggerSave();
        this.deadLinePicker.setChosenDate(tasksRepository.currentItem.deadline);
        this.statusSelectField.setChosenItem(tasksRepository.currentItem.status);
        Materialize.updateTextFields();
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> tasksRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { id: tasksRepository.currentItem.id, //używane tylko przy edycji
                            name: $('#'+this.id + 'nameTextField').val(),
                            description: $('#'+this.id + 'descriptionReachTextArea').val(),
                            deadline: $('#' + this.id + 'deadLinePickerField').val(),
                            status: this.$formElements[3].find('input').val(),
                            caseId: casesRepository.currentItem.id
                          };
        this.deadLinePicker.checkDate();
        tasksRepository.setCurrentItem(this.dataObject);
    }
    
};