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
var PersonModal = /** @class */ (function (_super) {
    __extends(PersonModal, _super);
    function PersonModal(id, title, connectedResultsetComponent) {
        var _this_1 = _super.call(this, id, title, connectedResultsetComponent, 'ADD_NEW') || this;
        _this_1.entityAutocompleteTextField = new AutoCompleteTextField(_this_1.id + 'entityAutoCompleteTextField', 'Firma', 'business_center', true, 'Wybierz nazwę podmiotu z listy');
        var _this = _this_1;
        _this_1.formElements = [
            {
                input: new InputTextField(_this_1.id + 'nameTextField', 'Imię', undefined, true, 100),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(_this_1.id + 'surnameTextField', 'Nazwisko', undefined, true, 50, '.{3,}'),
                dataItemKeyName: 'surname'
            },
            {
                input: new InputTextField(_this_1.id + 'positionTextField', 'Stanowisko', undefined, false, 50, '.{3,}'),
                dataItemKeyName: 'position'
            },
            {
                input: new InputTextField(_this_1.id + 'emailTextField', 'E-mail', undefined, true, 50),
                dataItemKeyName: 'email'
            },
            {
                input: _this_1.entityAutocompleteTextField,
                dataItemKeyName: '_entity',
                refreshDataSet: function () {
                    _this.entityAutocompleteTextField.initialise(MainSetup.entitiesRepository, "name", this.onEntityChosen, this);
                }
            },
            {
                input: new InputTextField(_this_1.id + 'cellphoneTextField', 'Tel. kom.', undefined, false, 25, '.{7,}'),
                dataItemKeyName: 'cellphone'
            },
            {
                input: new InputTextField(_this_1.id + 'phoneTextField', 'Tel.', undefined, false, 25, '.{7,}'),
                dataItemKeyName: 'phone'
            },
            {
                input: new ReachTextArea(_this_1.id + 'commentReachTextArea', 'Uwagi', false, 300),
                dataItemKeyName: 'comment'
            }
        ];
        _this_1.initialise();
        return _this_1;
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    PersonModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {};
        this.entityAutocompleteTextField.initialise(MainSetup.entitiesRepository, "name", this.onEntityChosen, this);
        this.entityAutocompleteTextField.setValue(MainSetup.entitiesRepository.currentItem);
    };
    return PersonModal;
}(Modal));
;
