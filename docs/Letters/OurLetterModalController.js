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
var OurLetterModalController = /** @class */ (function (_super) {
    __extends(OurLetterModalController, _super);
    function OurLetterModalController(modal) {
        return _super.call(this, modal) || this;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    OurLetterModalController.prototype.initAddNewDataHandler = function () {
        _super.prototype.initAddNewDataHandler.call(this);
        LettersSetup.lettersRepository.currentItem.isOur = true;
        if (LettersSetup.contractsRepository.items.length === 1)
            this.modal.contractFormElement.input.simulateChosenItem(LettersSetup.contractsRepository.items[0]);
    };
    OurLetterModalController.prototype.onCaseChosen = function (chosenItem) {
        _super.prototype.onCaseChosen.call(this, chosenItem);
        this.initaliseTemplateSelectField();
    };
    OurLetterModalController.prototype.onCaseUnchosen = function (unChosenItem) {
        this.initaliseTemplateSelectField();
    };
    OurLetterModalController.prototype.initaliseTemplateSelectField = function () {
        var _this = this;
        var templatesForCases = MainSetup.documentTemplatesRepository.items.filter(function (template) {
            var test = false;
            for (var _i = 0, _a = _this.modal.caseCollapsibleMultiSelect.value; _i < _a.length; _i++) {
                var caseItem = _a[_i];
                test = !template._contents.caseTypeId || template._contents.caseTypeId === caseItem._type.id;
                if (test)
                    return test;
            }
            return test;
        });
        this.modal.templateSelectField.initialise(templatesForCases, '_nameContentsAlias', this.onTemplateChosen, this);
        if (templatesForCases.length === 1)
            this.modal.templateSelectField.simulateChosenItem(templatesForCases[0]);
    };
    OurLetterModalController.prototype.onTemplateChosen = function (chosenItem) {
        if (chosenItem && chosenItem !== this.modal.templateFormElement.defaultDisabledOption) {
            MainSetup.documentTemplatesRepository.currentItem = chosenItem;
        }
        else {
            MainSetup.documentTemplatesRepository.currentItem = {};
        }
    };
    OurLetterModalController.prototype.initFileInput = function () {
        this.modal.fileFormElement.input.isRequired = false;
        this.modal.form.setElementDescription(this.setFileInputDescription(), this.modal.fileFormElement);
    };
    OurLetterModalController.prototype.setFileInputDescription = function () {
        var description = '';
        description = 'Wybierz załączniki. ';
        description += 'Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]. <br>';
        if (this.modal.mode == 'EDIT')
            description += 'Jeżeli nie chcesz zmieniać załączników, zignoruj to pole';
        return description;
    };
    return OurLetterModalController;
}(LetterModalController));
;
