class TaskModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
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
        
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                     'Imię i nazwisko', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.personAutoCompleteTextField.initialise(personsRepository,"nameSurnameEmail", this.onOwnerChosen, this);
        
        this.formElements = [
            new InputTextField (this.id + 'nameTextField','Nazwa zadania', undefined, true, 150),
            this.descriptionReachTextArea,
            this.deadLinePicker,
            this.statusSelectField,
            this.personAutoCompleteTextField
        ];
        this.initialise();
    }

    fillWithData(){
        this.form.fillWithData([
            tasksRepository.currentItem.name,
            tasksRepository.currentItem.description,
            tasksRepository.currentItem.deadline,
            tasksRepository.currentItem.status,
            tasksRepository.currentItem.nameSurnameEmail,
        ]);
    }
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> tasksRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { name: '',
                            description: '',
                            deadline: '',
                            status: '',
                            ownerId: '',
                          };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)){
            this.dataObject.id = tasksRepository.currentItem.id, //używane tylko przy edycji
            this.dataObject.caseId = casesRepository.currentItem.id;
            tasksRepository.setCurrentItem(this.dataObject);
        }
    }    
};