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
var IncomingLetterModal = /** @class */ (function (_super) {
    __extends(IncomingLetterModal, _super);
    function IncomingLetterModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this_1.controller = new IncomingLetterModalController(_this_1);
        _this_1.doChangeFunctionOnItemName = undefined;
        _this_1.doAddNewFunctionOnItemName = undefined;
        _this_1.initFormElements();
        _this_1.formElements = [
            _this_1.numberFormElement,
            _this_1.contractFormElement,
            _this_1.caseNEWFormElement,
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
    IncomingLetterModal.prototype.initFormElements = function () {
        _super.prototype.initFormElements.call(this);
        var _this = this;
        this.entityMainFormElement.input.setLabel('Dodaj nadawcę');
        this.numberFormElement = {
            input: new InputTextField(this.id + 'numberTextField', 'Numer pisma', undefined, false, 40),
            description: 'Nadaj ręcznie numer pisma',
            dataItemKeyName: 'number',
            refreshDataSet: function () {
                _this.controller.initNumberInput();
            }
        };
    };
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    IncomingLetterModal.prototype.initAddNewData = function () {
        this.controller.initAddNewDataHandler();
    };
    return IncomingLetterModal;
}(LetterModal));
