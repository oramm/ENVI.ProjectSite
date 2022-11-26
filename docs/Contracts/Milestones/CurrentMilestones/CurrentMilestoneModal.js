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
var CurrentMilestoneModal = /** @class */ (function (_super) {
    __extends(CurrentMilestoneModal, _super);
    function CurrentMilestoneModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.typeSelectField = new SelectField(_this.id + 'typeSelectField', 'Typ kamienia milowego', undefined, false);
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 500);
        _this.startDatePicker = new DatePicker(_this.id + 'startDatePickerField', 'Początek', true);
        _this.endDatePicker = new DatePicker(_this.id + 'endDatePickerField', 'Koniec', true);
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', undefined, true);
        _this.statusSelectField.initialise(MilestonesSetup.statusNames);
        _this.formElements = [
            { input: _this.typeSelectField,
                dataItemKeyName: '_type', refreshDataSet: function () {
                    var _this = this;
                    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(function (item) { return _this.checkContractType(item.contractType); });
                    this.input.initialise(currentMilestoneTypes, 'name');
                },
                checkContractType: function (type) {
                    var regExpr;
                    if (MilestonesSetup.milestonesRepository.currentItem._contractType.name !== 'Żółty')
                        regExpr = new RegExp(MilestonesSetup.milestonesRepository.currentItem._parent._ourType + '|^$' + '|' + MilestonesSetup.milestonesRepository.currentItem._contractType.name);
                    else
                        regExpr = new RegExp(MilestonesSetup.milestonesRepository.currentItem._parent._ourType + '|^$' + '|Żółty|Czerwony');
                    return Array.isArray(type.match(regExpr));
                }
            },
            { input: new InputTextField(_this.id + 'nameTextField', 'Dopisek', undefined, false, 50),
                dataItemKeyName: 'name'
            },
            { input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            { input: _this.startDatePicker,
                dataItemKeyName: 'startDate'
            },
            { input: _this.endDatePicker,
                dataItemKeyName: 'endDate'
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
    CurrentMilestoneModal.prototype.initAddNewData = function () { };
    return CurrentMilestoneModal;
}(Modal));
;
