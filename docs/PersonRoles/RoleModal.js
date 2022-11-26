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
var RoleModal = /** @class */ (function (_super) {
    __extends(RoleModal, _super);
    function RoleModal(id, title, connectedResultsetComponent, mode) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this_1.descriptionReachTextArea = new ReachTextArea(_this_1.id + 'descriptionReachTextArea', 'Opis', true, 500);
        _this_1.personAutoCompleteTextField = new AutoCompleteTextField(_this_1.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', true, 'Wybierz imię i nazwisko');
        var _this = _this_1;
        _this_1.formElements = [
            {
                input: new InputTextField(_this_1.id + 'nameTextField', 'Nazwa roli', undefined, true, 100),
                dataItemKeyName: 'name'
            },
            {
                input: _this_1.personAutoCompleteTextField,
                dataItemKeyName: '_person',
                refreshDataSet: function () {
                    _this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
                }
            },
            {
                input: _this_1.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    RoleModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem =
            {
                projectOurId: MainSetup.currentProject.ourId,
                _group: this.connectedResultsetComponent.parentDataItem,
                _contract: {}
            };
        this.personAutoCompleteTextField.setValue(MainSetup.personsRepository.currentItem);
        this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
    };
    return RoleModal;
}(Modal));
;
