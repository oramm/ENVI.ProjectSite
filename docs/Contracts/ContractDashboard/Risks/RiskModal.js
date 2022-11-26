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
var RiskModal = /** @class */ (function (_super) {
    __extends(RiskModal, _super);
    function RiskModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.milestonesSelectField = new SelectField(_this.id + '_milestonesSelectField', 'Kamień milowy', undefined, true);
        _this.milestonesSelectField.initialise(RisksSetup.milestonesRepository.items.filter(function (item) { return item.contractId == RisksSetup.contractsRepository.currentItem.id; }), '_FolderNumber_TypeName_Name');
        _this.milestonesSelectField.$select.on('change', function () { return _this.onMilestoneChosen(_this.milestonesSelectField.getValue()); });
        _this.caseSelectField = new SelectField(_this.id + 'caseSelectField', 'Sprawa', undefined, true);
        //this.caseSelectField.initialise(RisksSetup.casesRepository.items, 'name');
        _this.probabilitySelectField = new SelectField(_this.id + '_probabilitySelectField', 'Prawdopodobieństwo', true);
        _this.probabilitySelectField.initialise(RisksSetup.probabilityRates);
        _this.overallImpactSelectField = new SelectField(_this.id + '_overallImpactSelectField', 'Wpływ na projekt', true);
        _this.overallImpactSelectField.initialise(RisksSetup.overallImpactRates);
        _this.formElements = [
            { input: _this.milestonesSelectField,
                dataItemKeyName: '_parent',
            },
            { input: _this.caseSelectField,
                dataItemKeyName: '_case'
            },
            { input: new ReachTextArea(_this.id + '_causeReachTextArea', 'Przyczyna', false, 500),
                dataItemKeyName: 'cause'
            },
            { input: new ReachTextArea(_this.id + '_scheduleImpactDescriptionReachTextArea', 'Wpływ na harmonogram', false, 500),
                dataItemKeyName: 'scheduleImpactDescription'
            },
            { input: new ReachTextArea(_this.id + '_costImpactDescriptionReachTextArea', 'Wpływ na koszt', false, 500),
                dataItemKeyName: 'costImpactDescription'
            },
            { input: _this.probabilitySelectField,
                dataItemKeyName: 'probability'
            },
            { input: _this.overallImpactSelectField,
                dataItemKeyName: 'overallImpact'
            },
            { input: new ReachTextArea(_this.id + '_additionalActionsDescriptionReachTextArea', 'Działania dodatkowe', false, 500),
                dataItemKeyName: 'additionalActionsDescription'
            }
        ];
        _this.initialise();
        return _this;
    }
    RiskModal.prototype.onMilestoneChosen = function (inputValue) {
        RisksSetup.milestonesRepository.currentItem = inputValue;
        var currentCases = RisksSetup.casesRepository.items.filter(function (item) { return item._parent.id == inputValue.id; });
        //var currentMilestonesNames = currentMilestones.map(item=>item.name);
        this.caseSelectField.initialise(currentCases, '_typeFolderNumber_TypeName_Number_Name');
    };
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    RiskModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            projectOurId: RisksSetup.contractsRepository.parentItemId
        };
    };
    return RiskModal;
}(Modal));
