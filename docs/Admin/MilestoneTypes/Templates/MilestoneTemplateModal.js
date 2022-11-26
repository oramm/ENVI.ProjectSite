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
var MilestoneTemplateModal = /** @class */ (function (_super) {
    __extends(MilestoneTemplateModal, _super);
    function MilestoneTemplateModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 500);
        _this.formElements = [
            {
                input: new InputTextField(_this.id + 'nameTextField', 'Dopisek', undefined, false, 50),
                dataItemKeyName: 'name',
                refreshDataSet: function () {
                    //użytkownik edytuje 
                    if (ContractTypesSetup.milestoneTypesRepository.currentItem.isUniquePerContract) {
                        this.input.$dom.hide();
                    }
                    else
                        this.input.$dom.show();
                }
            },
            {
                input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    MilestoneTemplateModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _milestoneType: ContractTypesSetup.milestoneTypesRepository.currentItem
        };
    };
    return MilestoneTemplateModal;
}(Modal));
;
