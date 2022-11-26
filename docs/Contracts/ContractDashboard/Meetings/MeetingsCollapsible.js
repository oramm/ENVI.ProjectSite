"use strict";
class MeetingsCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            hasArchiveSwitch: true,
            connectedRepository: MeetingsSetup.meetingsRepository
            //subitemsCount: 12
        });
        this.addNewModal = new MeetingModal(id + '_newMeetingModal', 'Zaplanuj spotkanie', this, 'ADD_NEW');
        this.editModal = new MeetingModal(id + '_editMeetingModal', 'Edytuj spotkanie', this, 'EDIT');
        this.addNewMeetingArrangementModal = new MeetingArrangementModal(this.id + '_newMeetingArrangementModal', 'Dodaj ustalenie', this, 'ADD_NEW');
        this.editMeetingArrangementModal = new MeetingArrangementModal(this.id + '_editMeetingArrangementModal', 'Edytuj ustalenie', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        let item = super.makeItem(dataItem);
        item.name = dataItem.name + ' ' + dataItem.date;
        return item;
    }
    makeBody(dataItem) {
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
        let subCollection = new MeetingArrangementsCollection({
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
    }
    /*
     *
     */
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
    }
    createProtocolAction() {
        MeetingsSetup.meetingsRepository.currentItem._contract = MeetingsSetup.currentContract;
        MeetingsSetup.meetingsRepository.currentItem._contract._parent = MainSetup.currentProject;
        MeetingsSetup.meetingsRepository.doChangeFunctionOnItem(MeetingsSetup.meetingsRepository.currentItem, 'createMeetingProtocol', this);
    }
}
