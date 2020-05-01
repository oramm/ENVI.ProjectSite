class ProcessOurLetterModal extends ModalExternalRepository {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode, LettersSetup.lettersRepository);
        this.controller = new ProcessOurLetterModalController(this);
        this.doChangeFunctionOnItemName = 'editProcessStepInstanceOurLetter';
        this.doAddNewFunctionOnItemName = 'addNewProcessStepInstanceOurLetter';

        this.entityMainAutoCompleteTextField = new AutoCompleteTextField(this.id + '_entityMainAutoCompleteTextField',
            '',
            'business',
            false,
            'Wybierz nazwę')
        this.entityMainAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', this.controller.onEntityMainChosen, this.controller);
        this.selectedEntitiesMainHiddenInput = new HiddenInput(this.id + '_currentEntitiesMainHiddenInput', undefined, true);

        this.letterFileInput = new FileInput(this.id + '_letter_FileInput', 'Wybierz plik', this, false);

        var _this = this;
        this.creationDateFormElement = {
            input: new DatePicker(this.id + '_creationDatePickerField', 'Data sporządzenia', undefined, true),
            dataItemKeyName: 'creationDate'
        };
        this.registrationDateFormElement = {
            input: new DatePicker(this.id + '_registrationDatePickerField', 'Data nadania', undefined, true),
            dataItemKeyName: 'registrationDate'
        };

        this.entityMainFormElement = {
            input: this.entityMainAutoCompleteTextField,
            description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego podmiotu, możesz to pole zignorować' : 'Dodaj odbiorcę',
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

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
};
