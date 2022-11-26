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
var CaseModal = /** @class */ (function (_super) {
    __extends(CaseModal, _super);
    function CaseModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        var _this = _this_1;
        _this_1.typeSelectField = new SelectField(_this_1.id + 'typeSelectField', 'Typ sprawy', undefined, true);
        _this_1.typeSelectField.$select.on('change', function () {
            _this.formElements[1].refreshDataSet();
        });
        //this.typeSelectField.initialise(CasesSetup.caseTypesRepository.items, 'name');
        _this_1.formElements = [
            {
                input: _this_1.typeSelectField,
                dataItemKeyName: '_type',
                refreshDataSet: function () {
                    var _this_1 = this;
                    var currentCaseTypes = CasesSetup.caseTypesRepository.items.filter(function (item) { return _this_1.checkCaseType(item); });
                    this.input.initialise(currentCaseTypes, 'name');
                    //console.log('ContractsSetup.contractsRepository.currentItem.ourType:: ' + ContractsSetup.contractsRepository.currentItem._ourType);
                },
                checkCaseType: function (caseTypeItem) {
                    //wyklucz typy unikalne, dla których sprawy dodano już wcześniej
                    var allowType = true;
                    if (caseTypeItem.isUniquePerMilestone)
                        CasesSetup.casesRepository.items.map(function (existingCaseItem) {
                            if (existingCaseItem._type.id == caseTypeItem.id)
                                //jeśli edytujesz dopuść typ istniejący taki jak ten edytowany
                                if (_this.mode == 'EDIT' &&
                                    CasesSetup.casesRepository.currentItem._type.id != existingCaseItem._type.id ||
                                    _this.mode != 'EDIT') {
                                    allowType = false;
                                }
                        });
                    return allowType; //caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
                }
            },
            {
                input: new InputTextField(_this_1.id + 'nameTextField', 'Nazwa sprawy', undefined, false, 150),
                dataItemKeyName: 'name',
                refreshDataSet: function () {
                    //użytkownik edytuje 
                    if (_this.typeSelectField.getValue() && _this.typeSelectField.getValue().isUniquePerMilestone) {
                        this.input.$dom.hide();
                    }
                    else
                        this.input.$dom.show();
                },
            },
            {
                input: new ReachTextArea(_this_1.id + 'descriptionReachTextArea', 'Opis', false, 300),
                dataItemKeyName: 'description'
            }
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    CaseModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: CasesSetup.currentMilestone,
            _processesInstances: [],
            _risk: {}
        };
    };
    CaseModal.prototype.onTypeChosen = function (chosenItem) {
        this.formElements[1].refreshDataSet();
    };
    return CaseModal;
}(Modal));
;
