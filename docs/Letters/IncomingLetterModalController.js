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
var IncomingLetterModalController = /** @class */ (function (_super) {
    __extends(IncomingLetterModalController, _super);
    function IncomingLetterModalController(modal) {
        return _super.call(this, modal) || this;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    IncomingLetterModalController.prototype.initAddNewDataHandler = function () {
        _super.prototype.initAddNewDataHandler.call(this);
        this.modal.connectedResultsetComponent.connectedRepository.currentItem.isOur = false;
    };
    /*
     * ustawia stan po otwarciu okna
     */
    IncomingLetterModalController.prototype.initNumberInput = function () {
        this.modal.numberFormElement.input.setValue('');
    };
    IncomingLetterModalController.prototype.initFileInput = function () {
        this.modal.fileFormElement.input.isRequired = this.modal.mode === 'ADD_NEW';
        this.modal.form.setElementDescription(this.setFileInputDescription(), this.modal.fileFormElement);
    };
    IncomingLetterModalController.prototype.setFileInputDescription = function () {
        var description = '';
        description = 'Wybierz plik pisma i ew. załączniki. ';
        description += 'Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]. <br>';
        if (this.modal.mode == 'EDIT')
            description += 'Jeżeli nie chcesz zmieniać załączników, zignoruj to pole';
        return description;
    };
    return IncomingLetterModalController;
}(LetterModalController));
;
