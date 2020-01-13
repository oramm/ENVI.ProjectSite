class StepModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);

        this.documentTemplateSelectField = new SelectField(this.id + 'typeSelectField', 'Szablon pisma', undefined, false);
        var documentTemplatesForStep =  ProcessesSetup.documentTemplatesRepository.items.filter(
            item => item.caseTypeId && item.caseTypeId == ProcessesSetup.processesRepository.currentItem.caseTypeId
        )
        this.documentTemplateSelectField.initialise(documentTemplatesForStep, 'name');

        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', false, 500);

        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {
                input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {
                input: this.documentTemplateSelectField,
                dataItemKeyName: '_documentTemplate'
            }

        ];
        this.initialise();
    }

    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        //zainicjuj dane kontekstowe
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: ProcessesSetup.processesRepository.currentItem
        };

    }
};