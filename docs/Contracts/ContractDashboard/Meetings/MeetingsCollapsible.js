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
var MeetingsCollapsible = /** @class */ (function (_super) {
    __extends(MeetingsCollapsible, _super);
    function MeetingsCollapsible(id) {
        var _this = _super.call(this, {
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: MeetingsSetup.meetingsRepository
            //subitemsCount: 12
        }) || this;
        _this.addNewModal = new MeetingModal(id + '_newMeetingModal', 'Zaplanuj spotkanie', _this, 'ADD_NEW');
        _this.editModal = new MeetingModal(id + '_editMeetingModal', 'Edytuj spotkanie', _this, 'EDIT');
        _this.addNewMeetingArrangementModal = new MeetingArrangementModal(_this.id + '_newMeetingArrangementModal', 'Dodaj ustalenie', _this, 'ADD_NEW');
        _this.editMeetingArrangementModal = new MeetingArrangementModal(_this.id + '_editMeetingArrangementModal', 'Edytuj ustalenie', _this, 'EDIT');
        _this.initialise(_this.makeCollapsibleItemsList());
        return _this;
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    MeetingsCollapsible.prototype.makeItem = function (dataItem) {
        var item = _super.prototype.makeItem.call(this, dataItem);
        item.name = dataItem.name + ' ' + dataItem.date;
        return item;
    };
    MeetingsCollapsible.prototype.makeBody = function (dataItem) {
        var descriptionLabel = (dataItem.description) ? '<div class="row">' + dataItem.description + '</div>' : '';
        var title;
        var $meetingProtocolButton = $('<div class="row">');
        if (!dataItem._documentEditUrl) {
            title = 'Agenda';
            $meetingProtocolButton
                .append(new RaisedButton('Generuj notatkę', this.createProtocolAction, this).$dom);
        }
        else {
            title = 'Ustalenia';
            $meetingProtocolButton
                .append(new RaisedButton('Popraw notatkę', this.createProtocolAction, this).$dom);
        }
        var subCollection = new MeetingArrangementsCollection({
            id: 'meetingArrangementsCollection_' + dataItem.id,
            title: title,
            addNewModal: this.addNewMeetingArrangementModal,
            editModal: this.editMeetingArrangementModal,
            parentDataItem: dataItem,
            connectedResultsetComponent: this
        });
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .attr('meetingId', dataItem.id)
            .append($meetingProtocolButton)
            .append(descriptionLabel)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    };
    /*
     *
     */
    MeetingsCollapsible.prototype.selectTrigger = function (itemId) {
        _super.prototype.selectTrigger.call(this, itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    };
    MeetingsCollapsible.prototype.createProtocolAction = function () {
        MeetingsSetup.meetingsRepository.currentItem._contract = MeetingsSetup.currentContract;
        MeetingsSetup.meetingsRepository.currentItem._contract._parent = MainSetup.currentProject;
        MeetingsSetup.meetingsRepository.doChangeFunctionOnItem(MeetingsSetup.meetingsRepository.currentItem, 'createMeetingProtocol', this);
    };
    return MeetingsCollapsible;
}(SimpleCollapsible));
