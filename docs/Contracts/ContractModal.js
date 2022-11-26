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
var ContractModal = /** @class */ (function (_super) {
    __extends(ContractModal, _super);
    function ContractModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this_1.controller = new ContractModalController(_this_1);
        var notOurTypes = MainSetup.contractTypesRepository.items.filter(function (item) { return !item.isOur; });
        _this_1.typeSelectField = new SelectField(_this_1.id + '_type_SelectField', 'Typ kontraktu', undefined, true);
        _this_1.typeSelectField.initialise(notOurTypes, 'name');
        _this_1.commentReachTextArea = new ReachTextArea(_this_1.id + '_commentReachTextArea', 'Opis', false, 1000);
        _this_1.ourIdRelatedSelectField = new SelectField(_this_1.id + '_ourIdRelated_SelectField', 'Powiązana usługa IK lub PT', undefined, true);
        _this_1.ourIdRelatedSelectField.initialise(_this_1.makeOurPtIds(), '_ourIdOrNumber_Name');
        _this_1.statusSelectField = new SelectField(_this_1.id + '_status_SelectField', 'Status', undefined, true);
        _this_1.statusSelectField.initialise(ContractsSetup.statusNames);
        _this_1.contractorAutoCompleteTextField = new AutoCompleteTextField(_this_1.id + '_contractorAutoCompleteTextField', 'Dodaj wykonawcę', 'business', false, 'Wybierz nazwę');
        _this_1.contractorAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', _this_1.controller.onContractorChosen, _this_1.controller);
        _this_1.selectedContractorsHiddenInput = new HiddenInput(_this_1.id + '_currentContractorsHiddenInput', undefined, false);
        _this_1.employerAutoCompleteTextField = new AutoCompleteTextField(_this_1.id + '_employerAutoCompleteTextField', 'Dodaj zamawiającego', 'business', false, 'Wybierz nazwę');
        _this_1.employerAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', _this_1.controller.onEmployerChosen, _this_1.controller);
        _this_1.selectedEmployersHiddenInput = new HiddenInput(_this_1.id + '_currentEmployersHiddenInput', undefined, false);
        var _this = _this_1;
        _this_1.formElements = [
            {
                input: _this_1.typeSelectField,
                dataItemKeyName: '_type'
            },
            {
                input: new InputTextField(_this_1.id + 'numberTextField', 'Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {
                input: new InputTextField(_this_1.id + 'nameTextField', 'Nazwa kontraktu', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(_this_1.id + '_aliasTextField', 'Alias kontraktu', undefined, false, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie i w scrumboardzie',
                dataItemKeyName: 'alias'
            },
            {
                input: _this_1.ourIdRelatedSelectField,
                dataItemKeyName: '_ourContract'
            },
            {
                input: new DatePicker(_this_1.id + 'startDatePickerField', 'Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {
                input: new DatePicker(_this_1.id + 'endDatePickerField', 'Termin wykonania', true),
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
                input: _this_1.contractorAutoCompleteTextField,
                description: (_this_1.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego wykonawcy, możesz to pole zignorować' : '',
                dataItemKeyName: '_contractor'
            },
            {
                input: _this_1.selectedContractorsHiddenInput,
                dataItemKeyName: '_contractors',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet: function () {
                    _this.controller.contractorsChipsRefreshDataSet();
                }
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
            }
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * Tworzy listę kontraktów typu IK PT dla danego projektu
     */
    ContractModal.prototype.makeOurPtIds = function () {
        var ourPtIkContracts = ContractsSetup.otherContractsRepository.items.filter(function (item) { return item._ourType == 'PT' || item._ourType == 'IK'; });
        return ourPtIkContracts;
    };
    /** Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId */
    ContractModal.prototype.initAddNewData = function () {
        this.controller.initAddNewDataHandler();
    };
    /** Używana w Modal.triggerAction(); po wyświelteniu modala */
    ContractModal.prototype.initEditData = function () {
        this.controller.initEditDataHandler();
    };
    return ContractModal;
}(Modal));
;
