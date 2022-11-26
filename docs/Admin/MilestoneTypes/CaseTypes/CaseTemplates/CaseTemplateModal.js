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
var CaseTemplateModal = /** @class */ (function (_super) {
    __extends(CaseTemplateModal, _super);
    function CaseTemplateModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.formElements = [
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa sprawy', undefined, false, 150),
                dataItemKeyName: 'name',
                refreshDataSet: function () {
                    //użytkownik edytuje 
                    if (CaseTypesSetup.caseTypesRepository.currentItem.isUniquePerMilestone) {
                        this.input.$dom.hide();
                    }
                    else
                        this.input.$dom.show();
                }
            },
            { input: new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 300),
                dataItemKeyName: 'description'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    CaseTemplateModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = { _caseType: CaseTypesSetup.caseTypesRepository.currentItem
        };
    };
    return CaseTemplateModal;
}(Modal));
;
