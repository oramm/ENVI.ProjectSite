class LetterModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode, externalRepository) {
        super(id, tittle, connectedResultsetComponent, mode, externalRepository);
    }
    /*
     * uruchamiana po konstruktorze, przed jej wywołąniem musi być ustawiony controller
     */
    initFormElements() {
        this.contractSelectField = new SelectField(this.id + '_contractSelectField', 'Kontrakt', undefined, this.mode === 'ADD_NEW');
        if (LettersSetup.contractsRepository)
            this.contractSelectField.initialise(LettersSetup.contractsRepository.items, '_ourIdOrNumber_Name', this.controller.onContractChosen, this.controller);

        this.milestoneSelectField = new SelectField(this.id + '_milestoneSelectField', 'Kamień Milowy', undefined, false);
        this.caseSelectField = new SelectField(this.id + '_caseSelectField', 'Sprawa', undefined, false);
        this.selectedCasesHiddenInput = new HiddenInput(this.id + '_currentCasesHiddenInput', undefined, true);

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

        this.milestoneFormElement = {
            input: this.milestoneSelectField,
            description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
            dataItemKeyName: '_milestone'
        }
        this.caseFormElement = {
            input: this.caseSelectField,
            description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
            dataItemKeyName: '_case'
        };

        this.selectedCasesFormElement = {
            input: this.selectedCasesHiddenInput,
            dataItemKeyName: '_cases',
            //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
            refreshDataSet() {
                _this.controller.initCasesChips();
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
            dataItemKeyName: '_entityMain'
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
