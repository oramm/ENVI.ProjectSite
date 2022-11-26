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
var ProcessStepsInstancesModal = /** @class */ (function (_super) {
    __extends(ProcessStepsInstancesModal, _super);
    function ProcessStepsInstancesModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', true);
        _this.statusSelectField.initialise(ProcessesInstancesSetup.processesStepsInstancesStatusNames);
        _this.deadLinePicker = new DatePicker(_this.id + 'deadLinePickerField', 'Termin wykonania', true);
        _this.formElements = [
            { input: _this.statusSelectField,
                dataItemKeyName: 'status'
            },
            { input: _this.deadLinePicker,
                dataItemKeyName: 'deadline'
            }
        ];
        _this.initialise();
        return _this;
    }
    return ProcessStepsInstancesModal;
}(Modal));
;
