class OurLetterModal extends LetterModal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.controller = new OurLetterModalController(this);
        this.doChangeFunctionOnItemName = '';
        this.doAddNewFunctionOnItemName ='';
        var _this = this;
        this.initFormElements();

        this.formElements = [
            this.templateFormElement,
            this.contractFormElement,
            this.milestoneFormElement,
            this.caseFormElement,
            this.selectedCasesFormElement,
            this.creationDateFormElement,
            this.registrationDateFormElement,
            this.entityMainFormElement,
            this.selectedEntitiesMainFormElement,
            this.descriptionFormElement,
            this.fileFormElement
        ];
        this.initialise();
    }
    initFormElements() {
        super.initFormElements();
        this.templateSelectField = new SelectField(this.id + '_templateSelectField', 'Szablon', undefined, true);
        this.templateSelectField.initialise(LettersSetup.documentTemplatesRepository.items, 'name', this.controller.onTemplateChosen, this.controller);
        
        
        this.templateFormElement = {
            input: this.templateSelectField,
            description: 'Jeżeli rejestrujesz pismo po nowemu wybierz szablon. W przeciwnym razie zignoruj to pole i nadaj ręcznie numer pisma',
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
