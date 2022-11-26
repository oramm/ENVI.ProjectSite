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
var StepModal = /** @class */ (function (_super) {
    __extends(StepModal, _super);
    function StepModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.documentTemplateSelectField = new SelectField(_this.id + 'typeSelectField', 'Szablon pisma', undefined, false);
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 500);
        _this.formElements = [
            {
                input: new InputTextField(_this.id + 'nameTextField', 'Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {
                input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {
                input: _this.documentTemplateSelectField,
                dataItemKeyName: '_documentTemplate',
                refreshDataSet: function () {
                    var documentTemplatesForStep = ProcessesSetup.documentTemplatesRepository.items.filter(function (item) { return item._contents && item._contents.caseTypeId == ProcessesSetup.processesRepository.currentItem.caseTypeId; });
                    this.input.initialise(documentTemplatesForStep, '_nameContentsAlias');
                }
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    StepModal.prototype.initAddNewData = function () {
        //zainicjuj dane kontekstowe
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: ProcessesSetup.processesRepository.currentItem
        };
    };
    return StepModal;
}(Modal));
;
