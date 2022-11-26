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
var MilestoneTypeContractTypeAssociationModal = /** @class */ (function (_super) {
    __extends(MilestoneTypeContractTypeAssociationModal, _super);
    function MilestoneTypeContractTypeAssociationModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        //this.milestoneTypeSelectField = new SelectFieldBrowserDefault(this.id + 'contractTypeSelectField', 'Typ kamienia milowego', true);
        //this.milestoneTypeSelectField.initialise(ContractTypesSetup.milestonesTypesRepository);
        _this_1.milestoneTypeSelectField = new SelectField(_this_1.id + '_milestoneTypeSelectField', 'Typ kamienia milowego', true);
        var _this = _this_1;
        _this_1.formElements = [
            {
                input: new InputTextField(_this_1.id + 'folderNumberTextField', 'Numer folderu GD', undefined, true, 2),
                dataItemKeyName: 'folderNumber'
            },
            {
                input: _this_1.milestoneTypeSelectField,
                dataItemKeyName: '_milestoneType',
                refreshDataSet: function () {
                    var _this_1 = this;
                    _this.setTitle(_this.title + ' ' + ContractTypesSetup.contractTypesRepository.currentItem.name);
                    var currentMilestoneTypes = ContractTypesSetup.milestoneTypesRepository.items.filter(function (item) { return _this_1.excludeAssociatedType(item); });
                    this.input.initialise(currentMilestoneTypes, 'name');
                    //console.log('ContractsSetup.contractsRepository.currentItem.ourType:: ' + ContractsSetup.contractsRepository.currentItem._ourType);
                },
                //wyklucz typy już przypisane wcześniej
                excludeAssociatedType: function (milestoneTypeItem) {
                    var test = true;
                    ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.items.map(function (associatedTypeItem) {
                        if (associatedTypeItem._milestoneType.id == milestoneTypeItem.id &&
                            associatedTypeItem._contractType.id == ContractTypesSetup.contractTypesRepository.currentItem.id) {
                            //jeśli edytujesz dopuść typ istniejący taki jak ten edytowany
                            if (_this.mode == 'EDIT' &&
                                ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.currentItem._milestoneType.id != associatedTypeItem._milestoneType.id ||
                                _this.mode != 'EDIT')
                                test = false;
                        }
                    });
                    return test;
                }
            },
            {
                input: new SwitchInput('', 'Ustaw jako domyślny'),
                dataItemKeyName: 'isDefault'
            },
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * Używana przy włączaniu Modala do edycji
     * @returns {undefined}
     */
    MilestoneTypeContractTypeAssociationModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _contractType: ContractTypesSetup.contractTypesRepository.currentItem
        };
    };
    return MilestoneTypeContractTypeAssociationModal;
}(Modal));
;
