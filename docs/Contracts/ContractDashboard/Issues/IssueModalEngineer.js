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
var IssueModalEngineer = /** @class */ (function (_super) {
    __extends(IssueModalEngineer, _super);
    function IssueModalEngineer(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.datePicker = new DatePicker(_this.id + 'datePickerField', 'Data zgłoszenia', true);
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + '_descriptionReachTextArea', 'Opis', false, 1000);
        _this.contractorsDescriptionReachTextArea = new ReachTextArea(_this.id + '_contractorsdescriptionReachTextArea', 'Opis', false, 1000);
        _this.deadLinePicker = new DatePicker(_this.id + 'deadLinePickerField', 'Termin wykonania', true);
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', true);
        _this.statusSelectField.initialise(IssuesSetup.statusNames);
        _this.personAutoCompleteTextField = new AutoCompleteTextField(_this.id + '_personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        _this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", _this.onOwnerChosen, _this);
        _this.formElements = [
            { input: _this.datePicker,
                dataItemKeyName: 'date'
            },
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            { input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            { input: _this.deadLinePicker,
                dataItemKeyName: 'deadline'
            },
            { input: _this.statusSelectField,
                dataItemKeyName: 'status'
            },
            { input: _this.personAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    IssueModalEngineer.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = { contractId: this.connectedResultsetComponent.connectedRepository.parentItemId,
            _parent: IssuesSetup.currentContract
        };
    };
    return IssueModalEngineer;
}(Modal));
