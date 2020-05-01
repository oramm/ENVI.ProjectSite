class OurLetterModal extends LetterModal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.controller = new OurLetterModalController(this);
        this.doChangeFunctionOnItemName = '';
        this.doAddNewFunctionOnItemName = '';
        this.initFormElements();

        if (this.mode === 'ADD_NEW')
            this.formElements.push(this.templateFormElement);
        this.formElements.push(this.contractFormElement);
        this.formElements.push(this.milestoneFormElement);
        this.formElements.push(this.caseFormElement);
        this.formElements.push(this.selectedCasesFormElement);
        this.formElements.push(this.creationDateFormElement);
        this.formElements.push(this.registrationDateFormElement);
        this.formElements.push(this.entityMainFormElement);
        this.formElements.push(this.selectedEntitiesMainFormElement);
        this.formElements.push(this.descriptionFormElement);
        if (this.mode === 'ADD_NEW')
            this.formElements.push(this.fileFormElement);

        this.initialise();
    }
    initFormElements() {
        super.initFormElements();
        this.templateSelectField = new SelectField(this.id + '_templateSelectField', 'Szablon', undefined, true);
        this.templateSelectField.initialise(MainSetup.documentTemplatesRepository.items, 'name', this.controller.onTemplateChosen, this.controller);
        this.entityMainFormElement.input.setLabel('Dodaj odbiorcę');
        this.registrationDateFormElement.input.setLabel('Data nadania');
        this.templateFormElement = {
            input: this.templateSelectField,
            description: '',
            dataItemKeyName: '_template',
        };
        this.fileFormElement.input.isRequired = false;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
};
