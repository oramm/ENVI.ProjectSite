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
var ProcessModal = /** @class */ (function (_super) {
    __extends(ProcessModal, _super);
    function ProcessModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.caseTypeSelectField = new SelectField(_this.id + 'typeSelectField', 'Typ sprawy', undefined, false);
        _this.caseTypeSelectField.initialise(ProcessesSetup.caseTypesRepository.items, 'name');
        _this.formElements = [
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa procesu', undefined, true, 50),
                dataItemKeyName: 'name'
            },
            { input: _this.caseTypeSelectField,
                dataItemKeyName: '_caseType'
            },
            { input: new ReachTextArea(_this.id + '_descriptonReachTextArea', 'Opis', false, 500),
                dataItemKeyName: 'description'
            },
            { input: new SwitchInput('Nieczynny', 'Aktywny'),
                dataItemKeyName: 'status'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    ProcessModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
        //Ustaw tu parametry kontekstowe jeśli konieczne
        };
    };
    return ProcessModal;
}(Modal));
;
