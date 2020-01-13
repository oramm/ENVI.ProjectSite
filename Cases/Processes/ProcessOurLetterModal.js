class ProcessOurLetterModal extends LetterModal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.forceEditBehavior = true;
        this.controller = new ProcessOurLetterModalController(this);
        this.doChangeFunctionOnItemName = 'addNewProcessStepInstanceOurLetter';
        this.doAddNewFunctionOnItemName = '';
        
        this.initFormElements();

        this.formElements = [
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
        this.entityMainFormElement.input.setLabel('Dodaj odbiorcę');
        this.registrationDateFormElement.input.setLabel('Data nadania');
        this.fileFormElement.input.isRequired = false;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
};
