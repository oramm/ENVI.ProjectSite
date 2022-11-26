class OurOldTypeLetterModal extends LetterModal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.controller = new OurOldTypeLetterModalController(this);
        this.doChangeFunctionOnItemName = '';
        this.doAddNewFunctionOnItemName ='';
        this.initFormElements();

        this.formElements = [
            this.numberFormElement,
            this.contractFormElement,
            this.caseNEWFormElement,
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
        var _this = this;
        
        this.numberFormElement = {
            input: new InputTextField(this.id + 'numberTextField', 'Numer pisma', undefined, true, 40),
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
