class LetterModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode, externalRepository) {
        super(id, title, connectedResultsetComponent, mode, externalRepository);
    }
    /*
     * uruchamiana po konstruktorze, przed jej wywołąniem musi być ustawiony controller
     */
    initFormElements() {
        this.contractSelectField = new SelectField(this.id + '_contractSelectField', 'Kontrakt', undefined, this.mode === 'ADD_NEW');
        if (LettersSetup.contractsRepository)
            this.contractSelectField.initialise(LettersSetup.contractsRepository.items, '_ourIdOrNumber_Name', this.controller.onContractChosen, this.controller);

        this.caseCollapsibleMultiSelect = new CollapsibleMultiSelect(
            this.id + "_casesCollapsibleMultiSelect",
            'Wybierz sprawy',
            true);

        this.entityMainAutoCompleteTextField = new AutoCompleteTextField(this.id + '_entityMainAutoCompleteTextField',
            '',
            'business',
            false,
            'Wybierz nazwę')
        this.entityMainAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', this.controller.onEntityMainChosen, this.controller);
        this.selectedEntitiesMainHiddenInput = new HiddenInput(this.id + '_currentEntitiesMainHiddenInput', undefined, true);

        this.letterFileInput = new FileInput(this.id + '_letter_FileInput', 'Wybierz plik', this, this.mode === 'ADD_NEW');

        var _this = this;

        this.contractFormElement = {
            input: this.contractSelectField,
            description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
            dataItemKeyName: '_contract',
        };

        this.caseNEWFormElement = {
            input: this.caseCollapsibleMultiSelect,
            description: (this.mode == 'EDIT') ? 'Przypisz pismo do jednej lub kilku spraw' : '',
            dataItemKeyName: '_cases',
            refreshDataSet() {
                _this.controller.caseSelectFieldInitialize();
            }
        };

        this.creationDateFormElement = {
            input: new DatePicker(this.id + '_creationDatePickerField', 'Data sporządzenia', undefined, true),
            dataItemKeyName: 'creationDate'
        };
        this.registrationDateFormElement = {
            input: new DatePicker(this.id + '_registrationDatePickerField', 'Data wpływu', undefined, true),
            dataItemKeyName: 'registrationDate'
        };

        this.entityMainFormElement = {
            input: this.entityMainAutoCompleteTextField,
            description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego podmiotu, możesz to pole zignorować' : '',
            dataItemKeyName: '_entityMain',
            refreshDataSet() {
                _this.entityMainAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', _this.controller.onEntityMainChosen, this.controller);
            }
        };

        this.selectedEntitiesMainFormElement = {
            input: this.selectedEntitiesMainHiddenInput,
            dataItemKeyName: '_entitiesMain',
            //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
            refreshDataSet() {
                _this.controller.initEntitiesMainChips();
            }
        };
        this.descriptionFormElement = {
            input: new ReachTextArea(this.id + '_descriptonReachTextArea', 'Opis', false, 300),
            dataItemKeyName: 'description'
        };
        this.fileFormElement = {
            input: this.letterFileInput,
            description: '',
            dataItemKeyName: '_blobEnviObjects',
            refreshDataSet() {
                _this.controller.initFileInput();
            }
        };
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
};
