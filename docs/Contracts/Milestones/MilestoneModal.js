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
var MilestoneModal = /** @class */ (function (_super) {
    __extends(MilestoneModal, _super);
    function MilestoneModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        /*
        this.contractsAutoCompleteTextField = new AutoCompleteTextField(this.id+'personAutoCompleteTextField',
                                                                        'Dotyczy kontraktu',
                                                                        'info',
                                                                        false,
                                                                        'Wybierz kontrakt')
        this.contractsAutoCompleteTextField.initialise(ContractsSetup.otherContractsRepository,"_ourIdOrNumber_Name", this.onContractChosen, this);
        */
        _this_1.typeSelectField = new SelectField(_this_1.id + 'typeSelectField', 'Typ kamienia milowego', undefined, true);
        _this_1.descriptionReachTextArea = new ReachTextArea(_this_1.id + 'descriptionReachTextArea', 'Opis', false, 500);
        _this_1.startDatePicker = new DatePicker(_this_1.id + 'startDatePickerField', 'Początek', true);
        _this_1.endDatePicker = new DatePicker(_this_1.id + 'endDatePickerField', 'Koniec', true);
        _this_1.statusSelectField = new SelectField(_this_1.id + 'statusSelectField', 'Status', undefined, true);
        _this_1.statusSelectField.initialise(MilestonesSetup.statusNames);
        var _this = _this_1;
        _this_1.formElements = [];
        if (_this_1.mode == 'ADD_NEW')
            _this_1.formElements
                .push({
                input: _this_1.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function () {
                    var _this_1 = this;
                    var currentMilestoneTypes = MilestonesSetup.milestoneTypesRepository.items.filter(function (item) { return item._contractType.id == ContractsSetup.contractsRepository.currentItem.typeId &&
                        _this_1.checkMilestoneType(item); });
                    //zostaw tylko elementy unique
                    currentMilestoneTypes = Tools.ArrNoDuplicates(currentMilestoneTypes);
                    this.input.initialise(currentMilestoneTypes, '_folderNumber_MilestoneTypeName', _this.onTypeChosen, _this);
                },
                checkMilestoneType: function (milestoneTypeItem) {
                    //wyklucz typy unikalne, dla których sprawy dodano już wcześniej
                    var allowType = true;
                    if (milestoneTypeItem.isUniquePerContract)
                        MilestonesSetup.milestonesRepository.items.map(function (existingMilestoneItem) {
                            if (existingMilestoneItem._type.id == milestoneTypeItem.id &&
                                existingMilestoneItem._parent.id == ContractsSetup.contractsRepository.currentItem.id)
                                //jeśli edytujesz dopuść typ istniejący taki jak ten edytowany
                                if (_this.mode == 'EDIT' &&
                                    MilestonesSetup.milestonesRepository.currentItem._type.id != existingMilestoneItem._type.id ||
                                    _this.mode != 'EDIT') {
                                    allowType = false;
                                }
                        });
                    return allowType; //caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
                }
            });
        _this_1.formElements
            .push({
            input: new InputTextField(_this_1.id + 'nameTextField', 'Dopisek', undefined, false, 50),
            dataItemKeyName: 'name',
            refreshDataSet: function (chosenItem) {
                //Otwarto okno - użytkownik dodaje nowy kamień
                if (_this.mode != 'EDIT' && !chosenItem)
                    this.input.$dom.hide();
                //Otwarto okno - Użytkownik edytuje nowy kamień
                else if (_this.mode == 'EDIT' && !chosenItem) {
                    if (MilestonesSetup.milestonesRepository.currentItem._type &&
                        MilestonesSetup.milestonesRepository.currentItem._type.isUniquePerContract)
                        this.input.$dom.hide();
                    else
                        this.input.$dom.show();
                }
                //Użytkownik wybrał typ kamienia - zmienił pole Typ
                else if (chosenItem) {
                    if (chosenItem.isUniquePerContract)
                        this.input.$dom.hide();
                    else
                        this.input.$dom.show();
                }
            }
        });
        _this_1.formElements
            .push({
            input: _this_1.descriptionReachTextArea,
            dataItemKeyName: 'description'
        });
        _this_1.formElements
            .push({
            input: _this_1.startDatePicker,
            dataItemKeyName: 'startDate'
        });
        _this_1.formElements
            .push({
            input: _this_1.endDatePicker,
            dataItemKeyName: 'endDate'
        });
        _this_1.formElements
            .push({
            input: _this_1.statusSelectField,
            dataItemKeyName: 'status'
        });
        _this_1.initialise();
        return _this_1;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    MilestoneModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: ContractsSetup.contractsRepository.currentItem,
            _type: { name: '' }
        };
    };
    MilestoneModal.prototype.onTypeChosen = function (chosenItem) {
        MilestonesSetup.milestoneTypesRepository.currentItems.push(chosenItem);
        this.formElements[1].refreshDataSet(chosenItem);
    };
    return MilestoneModal;
}(Modal));
;
