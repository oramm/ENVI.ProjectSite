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
var CaseTypeModal = /** @class */ (function (_super) {
    __extends(CaseTypeModal, _super);
    function CaseTypeModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + '_descriptionReachTextArea', 'Opis', false, 500);
        _this.formElements = [
            { input: new InputTextField(_this.id + '_nameTextField', 'Nazwa typu sprawy', undefined, false, 50),
                dataItemKeyName: 'name'
            },
            { input: new InputTextField(_this.id + 'folderNumberTextField', 'Numer folderu GD', undefined, true, 5),
                dataItemKeyName: 'folderNumber'
            },
            { input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            { input: new SwitchInput('', 'Ustaw jako domyślny'),
                dataItemKeyName: 'isDefault'
            },
            { input: new SwitchInput('', 'Ustaw jako domyślny w scrumboardzie'),
                dataItemKeyName: 'isInScrumByDefault'
            },
            { input: new SwitchInput('', 'Unikalny dla kamienia milowego'),
                dataItemKeyName: 'isUniquePerMilestone'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    CaseTypeModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = { _milestoneType: CaseTypesSetup.currentMilestoneType,
            _processes: []
        };
    };
    return CaseTypeModal;
}(Modal));
;
