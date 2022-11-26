"use strict";
class EventsCollection extends SimpleCollection {
    /*
     * @param {type} id
     * @param {boolean} isPlane - czy lista ma być prosta czy z Avatarem
     * @param {boolean} hasFilter - czy ma być filtr
     * @param {boolean} isAddable - czy można dodować nowe elementy
     */
    constructor(initParamObject) {
        super({ id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            connectedRepository: CasesSetup.eventsRepository
        });
        this.status = initParamObject.status;
        this.initialise(this.makeList());
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeItem(dataItem) {
        var title, $description;
        switch (dataItem._eventType) {
            case 'LETTER':
                title = this.makeLetterTitle(dataItem);
                $description = this.makeLetterDescription(dataItem);
                break;
            case 'MEETING_ARRENGEMENT':
                title = this.makeMeetingArrangementTitle(dataItem);
                $description = this.makeMeetingArrangementDescription(dataItem);
                break;
        }
        return { id: dataItem.id,
            icon: undefined,
            $title: title,
            $description: $description,
            dataItem: dataItem
        };
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeLetterTitle(dataItem) {
        if (!dataItem.description)
            dataItem.description = "";
        var name = '';
        name += '<strong>' + dataItem.creationDate + '</strong> Pismo: ' + dataItem.description + ' ';
        return name;
    }
    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeMeetingArrangementTitle(dataItem) {
        if (!dataItem.description)
            dataItem.description = "";
        var name = '';
        name += '<strong>' + dataItem._parent.date + '</strong> Ustalenie ze spotkania: ' + dataItem.name + ' ';
        return name;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeLetterDescription(dataItem) {
        var description = '';
        description += (dataItem.isOur) ? 'Do:&nbsp;' : 'Od:&nbsp;';
        description += this.makeEntitiesLabel(dataItem._entitiesMain) + '<br>';
        description += 'Numer:&nbsp;' + dataItem.number + ', ';
        description += (dataItem.isOur) ? 'Nadano:&nbsp;' : 'Otrzymano:&nbsp;';
        description += '<strong>' + dataItem.registrationDate + '</strong>, ';
        var $collectionElementDescription = $('<span>');
        $collectionElementDescription
            .append($('<span>' + description + '</span><br>'))
            .append($('<span class="comment">Ostania zmiana danych pisma: ' + Tools.timestampToString(dataItem._lastUpdated) + ' ' +
            'przez&nbsp;' + dataItem._editor.name + '&nbsp;' + dataItem._editor.surname + '</span>'));
        return $collectionElementDescription;
    }
    makeEntitiesLabel(entities) {
        var label = '';
        for (var i = 0; i < entities.length - 1; i++) {
            label += entities[i].name + ', ';
        }
        if (entities[i])
            label += entities[i].name;
        return label;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeMeetingArrangementDescription(dataItem) {
        var description = '';
        description += dataItem.description + '<br>';
        description += 'Termin wykonania <strong>' + dataItem._parent.date + '</strong>, ';
        var $collectionElementDescription = $('<span>');
        $collectionElementDescription
            .append($('<span>' + description + '</span><br>'))
            .append($('<span class="comment">Ostania zmiana danych: ' + Tools.timestampToString(dataItem._lastUpdated) + ' ' +
            'przez&nbsp;' + dataItem._owner.name + '&nbsp;' + dataItem._owner.surname + '</span>'));
        return $collectionElementDescription;
    }
    makeList() {
        return super.makeList().filter((item) => item.dataItem._case.id == this.parentDataItem.id);
    }
    selectTrigger(itemId) {
        super.selectTrigger(itemId);
    }
}
