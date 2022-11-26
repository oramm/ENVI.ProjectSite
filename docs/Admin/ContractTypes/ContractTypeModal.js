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
var ContractTypeModal = /** @class */ (function (_super) {
    __extends(ContractTypeModal, _super);
    function ContractTypeModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + '_descriptonReachTextArea', 'Opis', false, 300);
        _this.formElements = [
            { input: new InputTextField(_this.id + 'nameTextField', 'Nazwa typu kontraktu', undefined, true, 10),
                dataItemKeyName: 'name'
            },
            { input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            { input: new SwitchInput('', 'Umowa ENVI'),
                dataItemKeyName: 'isOur'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    ContractTypeModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
        //Ustaw tu parametry kontekstowe jeśli konieczne
        };
    };
    return ContractTypeModal;
}(Modal));
;
