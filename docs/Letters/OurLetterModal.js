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
var OurLetterModal = /** @class */ (function (_super) {
    __extends(OurLetterModal, _super);
    function OurLetterModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.controller = new OurLetterModalController(_this);
        _this.doChangeFunctionOnItemName = '';
        _this.doAddNewFunctionOnItemName = '';
        _this.initFormElements();
        _this.formElements.push(_this.contractFormElement);
        _this.formElements.push(_this.caseNEWFormElement);
        if (_this.mode === 'ADD_NEW')
            _this.formElements.push(_this.templateFormElement);
        _this.formElements.push(_this.creationDateFormElement);
        _this.formElements.push(_this.registrationDateFormElement);
        _this.formElements.push(_this.entityMainFormElement);
        _this.formElements.push(_this.selectedEntitiesMainFormElement);
        _this.formElements.push(_this.descriptionFormElement);
        if (_this.mode === 'ADD_NEW')
            _this.formElements.push(_this.fileFormElement);
        _this.initialise();
        return _this;
    }
    OurLetterModal.prototype.initFormElements = function () {
        _super.prototype.initFormElements.call(this);
        this.templateSelectField = new SelectField(this.id + '_templateSelectField', 'Szablon', undefined, true);
        this.entityMainFormElement.input.setLabel('Dodaj odbiorcę');
        this.registrationDateFormElement.input.setLabel('Data nadania');
        this.templateFormElement = {
            input: this.templateSelectField,
            description: '',
            dataItemKeyName: '_template',
        };
        this.fileFormElement.input.isRequired = false;
    };
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    OurLetterModal.prototype.initAddNewData = function () {
        this.controller.initAddNewDataHandler();
    };
    return OurLetterModal;
}(LetterModal));
;
