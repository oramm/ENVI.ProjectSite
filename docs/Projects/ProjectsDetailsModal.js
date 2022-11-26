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
var ProjectsDetailsModal = /** @class */ (function (_super) {
    __extends(ProjectsDetailsModal, _super);
    function ProjectsDetailsModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this_1.controller = new ProjectModalController(_this_1);
        _this_1.commentReachTextArea = new ReachTextArea(_this_1.id + '_commentReachTextArea', 'Opis techniczny', false, 500);
        _this_1.financialCommentReachTextArea = new ReachTextArea(_this_1.id + '_financialCommentReachTextArea', 'Opis finansowy', false, 500);
        _this_1.statusSelectField = new SelectField(_this_1.id + '_statusSelectField', 'Status', true);
        _this_1.statusSelectField.initialise(['Nie rozpoczęty', 'W trakcie', 'Zakończony']);
        _this_1.employerAutoCompleteTextField = new AutoCompleteTextField(_this_1.id + '_employerAutoCompleteTextField', 'Dodaj zamawiającego', 'business', false, 'Wybierz nazwę');
        _this_1.employerAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', _this_1.controller.onEmployerChosen, _this_1.controller);
        _this_1.selectedEmployersHiddenInput = new HiddenInput(_this_1.id + '_currentEmployersHiddenInput', undefined, false);
        var _this = _this_1;
        _this_1.formElements = [
            {
                input: new InputTextField(_this_1.id + '_idTextField', 'Oznaczenie projektu', undefined, true, 150),
                dataItemKeyName: 'ourId'
            },
            {
                input: new InputTextField(_this_1.id + 'nameTextField', 'Nazwa', undefined, true, 300),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(_this_1.id + '_aliasTextField', 'Alias projektu', undefined, true, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie',
                dataItemKeyName: 'alias'
            },
            {
                input: _this_1.employerAutoCompleteTextField,
                description: (_this_1.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego zamawiającego, możesz to pole zignorować' : '',
                dataItemKeyName: '_employer'
            },
            {
                input: _this_1.selectedEmployersHiddenInput,
                dataItemKeyName: '_employers',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet: function () {
                    _this.controller.employersChipsRefreshDataSet();
                }
            },
            {
                input: new DatePicker(_this_1.id + 'startDatePickerField', 'Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {
                input: new DatePicker(_this_1.id + 'endDatePickerField', 'Zakończenie realizacji', true),
                dataItemKeyName: 'endDate'
            },
            {
                input: _this_1.statusSelectField,
                dataItemKeyName: 'status'
            },
            {
                input: _this_1.commentReachTextArea,
                dataItemKeyName: 'comment'
            },
            {
                input: _this_1.financialCommentReachTextArea,
                desciption: 'Te dane wprowadza koordynator finansowy projektu',
                dataItemKeyName: 'financialComment'
            },
            {
                input: new InputTextField(_this_1.id + 'totalValueTextField', 'Wartość całkowota netto', undefined, true, 20),
                dataItemKeyName: 'totalValue'
            },
            {
                input: new InputTextField(_this_1.id + 'qualifiedValueTextField', 'Koszty kwalifikowane', undefined, true, 20),
                dataItemKeyName: 'qualifiedValue'
            },
            {
                input: new InputTextField(_this_1.id + 'dotationValueTextField', 'Wartość dotacji', undefined, true, 20),
                dataItemKeyName: 'dotationValue'
            }
        ];
        _this_1.initialise();
        return _this_1;
    }
    return ProjectsDetailsModal;
}(Modal));
;
