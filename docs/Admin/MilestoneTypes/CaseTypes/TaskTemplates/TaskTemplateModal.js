class TaskTemplateModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode){
        super(id, title, connectedResultsetComponent,mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(TaskTemplatesSetup.statusNames);
        
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa zadania', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {   input: new InputTextField (this.id + 'deadlineRuleTextField','Reguła', undefined, false, 150),
                dataItemKeyName: 'deadlineRule'
            },
            {   input: this.statusSelectField,
                dataItemKeyName: 'status'
            }
        ];
        this.initialise();
    }
    
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){        
        this.connectedResultsetComponent.connectedRepository.currentItem = {    status: 'Backlog',
                                                                                _caseTemplate: TaskTemplatesSetup.currentCaseTemplate
                                                                           };
    }
};