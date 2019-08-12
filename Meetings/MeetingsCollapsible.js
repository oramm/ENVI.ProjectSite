class MeetingsCollapsible extends SimpleCollapsible {
    constructor(id){
        super({ id: id,
                hasFilter: true,
                isEditable: true, 
                isAddable: true, 
                isDeletable: true,
                hasArchiveSwitch: true,
                connectedRepository: MeetingsSetup.meetingsRepository
                //subitemsCount: 12
              });
        
        this.addNewModal = new MeetingModal(id + '_newMeetingModal', 'Dodaj spotkanie', this, 'ADD_NEW');
        this.editModal = new MeetingModal(id + '_editMeetingModal', 'Edytuj spotkanie', this, 'EDIT');
        
        
        this.addNewMeetingArrangementModal = new MeetingArrangementModal(this.id + '_newMeetingArrangementModal', 'Dodaj ustalenie', this, 'ADD_NEW');
        this.editMeetingArrangementModal = new MeetingArrangementModal(this.id + '_editMeetingArrangementModal', 'Edytuj ustelenie', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
        //trzeba zainicjować dane parentów na wypadek dodania nowego obiektu
        //funkcja Modal.submitTrigger() bazuje na danych w this.connectedRepository.currentItem
        
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom){
        return {    id: dataItem.id,
                    name: dataItem.name + ' ' + dataItem.date,
                    $body: $bodyDom,
                    dataItem: dataItem,
                    editModal: this.editModal
                    };
    }
    
    makeBodyDom(dataItem){
        var $descriptionLabel = $((dataItem.description)?'<BR>' + dataItem.description  : '');
        
        var $panel = $('<div>')
                .attr('id', 'collapsibleBody' + dataItem.id)
                .attr('meetingId',dataItem.id)
                .append($descriptionLabel)
                .append(new MeetingArrangementsCollection({id: 'meetingArrangementsCollection_' + dataItem.id, 
                            title: "Agenda/Ustalenia",
                            addNewModal: this.addNewMeetingArrangementModal,
                            editModal: this.editMeetingArrangementModal,
                            parentDataItem: dataItem,
                            connectedResultsetComponent: this
                           }).$dom);
        return $panel;
    }
    
    /*
     * 
     */
    selectTrigger(itemId){
        super.selectTrigger(itemId);
        //$('#contractDashboard').attr('src','ContractDashboard/ContractDashboard.html?parentItemId=' + this.connectedRepository.currentItem.id);
        }
}