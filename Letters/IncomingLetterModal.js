class IncomingLetterModal extends LetterModal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.controller = new IncomingLetterModalController(this);
        this.doChangeFunctionOnItemName = undefined;
        this.doAddNewFunctionOnItemName = undefined;
        this.initFormElements();

        this.formElements = [
            this.numberFormElement,
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
        var _this = this;
        this.entityMainFormElement.input.setLabel('Dodaj nadawcę');
        this.numberFormElement = {
            input: new InputTextField(this.id + 'numberTextField', 'Numer pisma', undefined, false, 40),
            description: 'Nadaj ręcznie numer pisma',
            dataItemKeyName: 'number',
            refreshDataSet() {
                _this.controller.initNumberInput();
            }
        };
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
}
