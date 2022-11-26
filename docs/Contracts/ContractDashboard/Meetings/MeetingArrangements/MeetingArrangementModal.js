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
var MeetingArrangementModal = /** @class */ (function (_super) {
    __extends(MeetingArrangementModal, _super);
    function MeetingArrangementModal(id, title, connectedResultsetComponent, mode) {
        var _this = _super.call(this, id, title, connectedResultsetComponent, mode) || this;
        _this.descriptionReachTextArea = new ReachTextArea(_this.id + 'descriptionReachTextArea', 'Opis', false, 500);
        _this.ownerAutoCompleteTextField = new AutoCompleteTextField(_this.id + '_ownerAutoCompleteTextField', 'Osoba odpowiedzialna', 'person', false, 'Wybierz imię i nazwisko');
        _this.ownerAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, '_nameSurnameEmail', undefined, _this);
        _this.caseCollapsibleSelect = new CollapsibleSelect(_this.id + "_casesCollapsibleSelect", 'Wybierz sprawę', MeetingsSetup.milestonesRepository, function (dataItem) { return dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name; }, MeetingsSetup.casesRepository, function (dataItem) {
            var title = (dataItem._type.folderNumber) ? dataItem._type.folderNumber : ' ' + ' ';
            title += (dataItem._type.name) ? dataItem._type.name : '[Nie przypisano typu]' + ' | ';
            title += (dataItem._displayNumber) ? ' ' + dataItem._displayNumber + ' ' : '' + ' ';
            title += (dataItem.name) ? dataItem.name : ' ';
            return title;
        }, true);
        _this.formElements = [
            {
                input: new InputTextField(_this.id + 'nameTextField', 'Nazwa', undefined, false, 150),
                dataItemKeyName: 'name'
            },
            {
                input: _this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            },
            {
                input: _this.caseCollapsibleSelect,
                dataItemKeyName: '_case'
            },
            {
                input: new DatePicker(_this.id + 'deadlinePickerField', 'Termin wykonania', true),
                dataItemKeyName: 'deadline'
            },
            {
                input: _this.ownerAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
        ];
        _this.initialise();
        return _this;
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    MeetingArrangementModal.prototype.initAddNewData = function () {
        //zainicjuj dane kontekstowe
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MeetingsSetup.meetingsRepository.currentItem
        };
    };
    return MeetingArrangementModal;
}(Modal));
;
