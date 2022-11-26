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
var OurContractModal = /** @class */ (function (_super) {
    __extends(OurContractModal, _super);
    function OurContractModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        var ourTypes = MainSetup.contractTypesRepository.items.filter(function (item) { return item.isOur; });
        _this.typeSelectField = new SelectField(_this.id + '_type_SelectField', 'Typ kontraktu', undefined, true);
        _this.typeSelectField.initialise(ourTypes, 'name');
        _this.commentReachTextArea = new ReachTextArea(_this.id + '_commentReachTextArea', 'Opis', false, 1000);
        _this.statusSelectField = new SelectField(_this.id + '_statusSelectField', 'Status', undefined, true);
        _this.statusSelectField.initialise(ContractsSetup.statusNames);
        _this.managerAutoCompleteTextField = new AutoCompleteTextField(_this.id + '_managerAutoCompleteTextField', 'Koordynator', 'person', false, 'Wybierz imię i nazwisko');
        _this.managerAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", _this.onManagerChosen, _this);
        _this.adminAutoCompleteTextField = new AutoCompleteTextField(_this.id + '_adminAutoCompleteTextField', 'Administrator', 'person', false, 'Wybierz imię i nazwisko');
        _this.adminAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", _this.onAdminChosen, _this);
        _this.formElements = [
            {
                input: _this.typeSelectField,
                dataItemKeyName: '_type'
            },
            {
                input: new InputTextField(_this.id + 'numberTextField', 'Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {
                input: new InputTextField(_this.id + 'nameTextField', 'Nazwa', undefined, true, 300),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(_this.id + '_aliasTextField', 'Alias kontraktu', undefined, false, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie i w scrumboardzie',
                dataItemKeyName: 'alias'
            },
            {
                input: new DatePicker(_this.id + 'startDatePickerField', 'Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {
                input: new DatePicker(_this.id + 'endDatePickerField', 'Termin wykonania', true),
                dataItemKeyName: 'endDate'
            },
            {
                input: new InputTextField(_this.id + 'valueTextField', 'Wartość umowy netto', undefined, true, 20),
                dataItemKeyName: 'value'
            },
            {
                input: _this.statusSelectField,
                dataItemKeyName: 'status'
            },
            {
                input: _this.commentReachTextArea,
                dataItemKeyName: 'comment'
            },
            {
                input: new InputTextField(_this.id + 'ourIdTextField', 'Oznaczenie zlecenia ENVI', undefined, true, 150),
                dataItemKeyName: 'ourId'
            },
            {
                input: _this.managerAutoCompleteTextField,
                dataItemKeyName: '_manager'
            },
            {
                input: _this.adminAutoCompleteTextField,
                dataItemKeyName: '_admin'
            }
        ];
        _this.initialise();
        return _this;
    }
    /** Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    OurContractModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MainSetup.currentProject,
            projectId: this.connectedResultsetComponent.connectedRepository.parentItemId
        };
    };
    /** Używana w Modal.triggerAction(); po wyświelteniu modala */
    OurContractModal.prototype.initEditData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem._parent = MainSetup.currentProject;
        this.connectedResultsetComponent.connectedRepository.currentItem.projectId = this.connectedResultsetComponent.connectedRepository.parentItemId;
    };
    return OurContractModal;
}(Modal));
;
