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
var ProcessAppendLetterAttachmentsModal = /** @class */ (function (_super) {
    __extends(ProcessAppendLetterAttachmentsModal, _super);
    function ProcessAppendLetterAttachmentsModal(id, title, connectedResultsetComponent) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, 'EDIT', LettersSetup.lettersRepository) || this;
        _this_1.doChangeFunctionOnItemName = 'appendProcessStepInstanceOurLetterAttachments';
        _this_1.initFormElements();
        _this_1.formElements = [
            _this_1.fileFormElement
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * uruchamiana po konstruktorze, przed jej wywołąniem musi być ustawiony controller
     */
    ProcessAppendLetterAttachmentsModal.prototype.initFormElements = function () {
        this.letterFileInput = new FileInput(this.id + '_letter_FileInput', 'Wybierz pliki', this, true);
        var _this = this;
        this.fileFormElement = {
            input: this.letterFileInput,
            description: '',
            dataItemKeyName: '_blobEnviObjects',
            refreshDataSet: function () {
                //_this.controller.initFileInput();
            }
        };
    };
    return ProcessAppendLetterAttachmentsModal;
}(ModalExternalRepository));
