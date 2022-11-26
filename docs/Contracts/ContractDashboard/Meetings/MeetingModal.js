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
var MeetingModal = /** @class */ (function (_super) {
    __extends(MeetingModal, _super);
    function MeetingModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.formElements = [
            { input: new DatePicker(_this.id + 'datePickerField', 'Data spotkania', true),
                dataItemKeyName: 'date'
            },
            { input: new InputTextField(_this.id + 'locationTextField', 'Miejsce spotkania', undefined, true, 50),
                dataItemKeyName: 'location'
            },
            { input: new InputTextField(_this.id + 'nameTextField', 'Tytuł', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            { input: new ReachTextArea(_this.id + '_descriptonReachTextArea', 'Opis', false, 500),
                dataItemKeyName: 'description'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    MeetingModal.prototype.initAddNewData = function () {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _contract: MeetingsSetup.currentContract
        };
    };
    return MeetingModal;
}(Modal));
;
