class ProjectsDetailsModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 500);
        this.financialCommentReachTextArea = new ReachTextArea (this.id + '_financialCommentReachTextArea','Opis', false, 500);
        
        this.statusSelectField = new SelectField(this.id + '_statusSelectField', 'Status', true);
        this.statusSelectField.initialise(['Nie rozpoczęty', 'W trakcie', 'Zakończony']);
        
        this.formElements = [
            new InputTextField (this.id + 'idTextField','Oznaczenie projektu', undefined, true, 150),
            new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
            new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
            new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
            this.statusSelectField,
            this.commentReachTextArea,
            this.financialCommentReachTextArea,
            new InputTextField (this.id + 'totalValueTextField','Wartość całkowota', undefined, true, 20),
            new InputTextField (this.id + 'qualifiedValueTextField','Koszty kwalifikowane', undefined, true, 20),
            new InputTextField (this.id + 'dotationValueTextField','Wartość dotacji', undefined, true, 20)
        ];
        this.initialise();
    }

    fillWithData(){
        ReachTextArea.reachTextAreaInit();
        
        this.form.fillWithData([
            this.connectedResultsetComponent.connectedRepository.currentItem.id,
            this.connectedResultsetComponent.connectedRepository.currentItem.name,
            this.connectedResultsetComponent.connectedRepository.currentItem.startDate,
            this.connectedResultsetComponent.connectedRepository.currentItem.endDate,
            this.connectedResultsetComponent.connectedRepository.currentItem.status,
            this.connectedResultsetComponent.connectedRepository.currentItem.comment,
            this.connectedResultsetComponent.connectedRepository.currentItem.financialComment,
            this.connectedResultsetComponent.connectedRepository.currentItem.totalValue,
            this.connectedResultsetComponent.connectedRepository.currentItem.qualifiedValue,
            this.connectedResultsetComponent.connectedRepository.currentItem.dotationValue
        ]);
    }
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> this.connectedResultsetComponent.connectedRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        tinyMCE.triggerSave();
        this.dataObject = { id: '',
                            name: '',
                            startDate: '',
                            endDate: '',
                            status: '',
                            comment: '',
                            financialComment: '',
                            totalValue: '',
                            qualifiedValue: '',
                            dotationValue: ''
                          };
        this.form.submitHandler(this.dataObject);
    }    
};