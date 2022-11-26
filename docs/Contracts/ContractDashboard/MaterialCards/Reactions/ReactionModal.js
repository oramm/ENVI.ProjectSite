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
var ReactionModal = /** @class */ (function (_super) {
    __extends(ReactionModal, _super);
    function ReactionModal(id, title, connectedResultsetComponent) {
        var _this = _super.call(this, id, title, connectedResultsetComponent) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 300);
        _this.deadLinePicker = new DatePicker(_this.id + 'deadLinePickerField', 'Termin wykonania', true);
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', true);
        _this.statusSelectField.initialise(ReactionsSetup.statusNames);
        _this.personAutoCompleteTextField = new AutoCompleteTextField(_this.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        _this.personAutoCompleteTextField.initialise(MainSetup.personsEnviRepository, "_nameSurnameEmail", _this.onOwnerChosen, _this);
        _this.formElements = [
            new InputTextField(_this.id + 'nameTextField', 'Nazwa zadania', undefined, true, 150),
            _this.descriptionReachTextArea,
            _this.deadLinePicker,
            //this.statusSelectField,
            _this.personAutoCompleteTextField
        ];
        _this.initialise();
        return _this;
    }
    ReactionModal.prototype.fillWithData = function () {
        this.form.fillWithData([
            teactionsRepository.currentItem.name,
            teactionsRepository.currentItem.description,
            teactionsRepository.currentItem.deadline,
            //teactionsRepository.currentItem.status,
            teactionsRepository.currentItem._nameSurnameEmail,
        ]);
    };
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> teactionsRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    ReactionModal.prototype.submitTrigger = function () {
        tinyMCE.triggerSave();
        this.dataObject = {
            name: '',
            description: '',
            deadline: '',
            //status: '',
            chosenPerson: '',
        };
        this.form.submitHandler(this.dataObject);
        if (this.form.validate(this.dataObject)) {
            this.dataObject.caseId = casesRepository.currentItem.id;
            this.dataObject._nameSurnameEmail = this.dataObject.chosenPerson._nameSurnameEmail;
            this.dataObject.ownerId = this.dataObject.chosenPerson.id;
        }
    };
    return ReactionModal;
}(Modal));
;
