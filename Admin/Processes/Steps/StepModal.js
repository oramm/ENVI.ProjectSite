class StepModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);

        this.documentTemplateSelectField = new SelectField(this.id + 'typeSelectField', 'Szablon pisma', undefined, false);


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
                dataItemKeyName: '_documentTemplate',
                refreshDataSet() {
                    var documentTemplatesForStep = ProcessesSetup.documentTemplatesRepository.items.filter(
                        item => item._contents && item._contents.caseTypeId == ProcessesSetup.processesRepository.currentItem.caseTypeId
                    )
                    this.input.initialise(documentTemplatesForStep, '_nameContentsAlias');
                }
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