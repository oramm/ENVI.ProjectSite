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
var TaskTemplateModal = /** @class */ (function (_super) {
    __extends(TaskTemplateModal, _super);
    function TaskTemplateModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 300);
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', true);
        _this.statusSelectField.initialise(TaskTemplatesSetup.statusNames);
        _this.formElements = [
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa zadania', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            { input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            { input: new InputTextField(_this.id + 'deadlineRuleTextField', 'Reguła', undefined, false, 150),
                dataItemKeyName: 'deadlineRule'
            },
            { input: _this.statusSelectField,
                dataItemKeyName: 'status'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    TaskTemplateModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = { status: 'Backlog',
            _caseTemplate: TaskTemplatesSetup.currentCaseTemplate
        };
    };
    return TaskTemplateModal;
}(Modal));
;
