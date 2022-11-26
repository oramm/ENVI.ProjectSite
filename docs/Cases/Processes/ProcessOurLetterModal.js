"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ProcessOurLetterModal = /** @class */ (function (_super) {
    __extends(ProcessOurLetterModal, _super);
    function ProcessOurLetterModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode, LettersSetup.lettersRepository) || this;
        _this_1.controller = new ProcessOurLetterModalController(_this_1);
        _this_1.doChangeFunctionOnItemName = 'editProcessStepInstanceOurLetter';
        _this_1.doAddNewFunctionOnItemName = 'addNewProcessStepInstanceOurLetter';
        _this_1.entityMainAutoCompleteTextField = new AutoCompleteTextField(_this_1.id + '_entityMainAutoCompleteTextField', '', 'business', false, 'Wybierz nazwę');
        _this_1.entityMainAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', _this_1.controller.onEntityMainChosen, _this_1.controller);
        _this_1.selectedEntitiesMainHiddenInput = new HiddenInput(_this_1.id + '_currentEntitiesMainHiddenInput', undefined, true);
        _this_1.letterFileInput = new FileInput(_this_1.id + '_letter_FileInput', 'Wybierz plik', _this_1, false);
        var _this = _this_1;
        _this_1.creationDateFormElement = {
            input: new DatePicker(_this_1.id + '_creationDatePickerField', 'Data sporządzenia', undefined, true),
            dataItemKeyName: 'creationDate'
        };
        _this_1.registrationDateFormElement = {
            input: new DatePicker(_this_1.id + '_registrationDatePickerField', 'Data nadania', undefined, true),
            dataItemKeyName: 'registrationDate'
        };
        _this_1.entityMainFormElement = {
            input: _this_1.entityMainAutoCompleteTextField,
            description: (_this_1.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego podmiotu, możesz to pole zignorować' : 'Dodaj odbiorcę',
            dataItemKeyName: '_entityMain'
        };
        _this_1.selectedEntitiesMainFormElement = {
            input: _this_1.selectedEntitiesMainHiddenInput,
            dataItemKeyName: '_entitiesMain',
            //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
            refreshDataSet: function () {
                _this.controller.initEntitiesMainChips();
            }
        };
        _this_1.descriptionFormElement = {
            input: new ReachTextArea(_this_1.id + '_descriptonReachTextArea', 'Opis', false, 300),
            dataItemKeyName: 'description'
        };
        _this_1.fileFormElement = {
            input: _this_1.letterFileInput,
            description: '',
            dataItemKeyName: '_blobEnviObjects',
            refreshDataSet: function () {
                _this.controller.initFileInput();
            }
        };
        _this_1.formElements = [
            _this_1.creationDateFormElement,
            _this_1.registrationDateFormElement,
            _this_1.entityMainFormElement,
            _this_1.selectedEntitiesMainFormElement,
            _this_1.descriptionFormElement,
            _this_1.fileFormElement
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    ProcessOurLetterModal.prototype.initAddNewData = function () {
        this.controller.initAddNewDataHandler();
    };
    return ProcessOurLetterModal;
}(ModalExternalRepository));
;
