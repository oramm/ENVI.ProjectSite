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
var MaterialCardModalContractor = /** @class */ (function (_super) {
    __extends(MaterialCardModalContractor, _super);
    function MaterialCardModalContractor(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.datePicker = new DatePicker(_this.id + 'datePickerField', 'Data zgłoszenia', true);
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + '_descriptionReachTextArea', 'Opis', false, 1000);
        _this.contractorsDescriptionReachTextArea = new ReachTextArea(_this.id + '_contractorsdescriptionReachTextArea', 'Opis', false, 1000);
        _this.deadLinePicker = new DatePicker(_this.id + 'deadLinePickerField', 'Termin wykonania', true);
        _this.statusSelectField = new SelectField(_this.id + 'statusSelectField', 'Status', true);
        _this.statusSelectField.initialise(MaterialCardsSetup.statusNames);
        _this.personAutoCompleteTextField = new AutoCompleteTextField(_this.id + '_personAutoCompleteTextField', 'Osoba odpowiedzialna', 'person', true, 'Wybierz imię i nazwisko');
        _this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", _this.onOwnerChosen, _this);
        _this.formElements = [
            { input: _this.datePicker,
                dataItemKeyName: 'creationDate'
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
    MaterialCardModalContractor.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _contract: MaterialCardsSetup.contractsRepository.currentItem,
            contractId: this.connectedResultsetComponent.connectedRepository.parentItemId,
            _versions: [],
            _editor: {
                name: MainSetup.currentUser.name,
                surname: MainSetup.currentUser.surname,
                systemEmail: MainSetup.currentUser.systemEmail
            },
            _lastUpdated: ''
        };
        this.form.fillWithData({ creationDate: Tools.dateJStoDMY(new Date())
        });
    };
    return MaterialCardModalContractor;
}(Modal));
