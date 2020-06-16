class MeetingArrangementsCollection extends SimpleCollection {
    constructor(initParamObject) {
        super({
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: initParamObject.title,
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: true,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            isSelectable: true,
            connectedRepository: MeetingsSetup.meetingArrangementsRepository
        });
        this.initialise(this.makeList());
        this.$actionsMenu.hide();
        //this.addNewModal.preppendTriggerButtonTo(this.$actionsMenu,"Przypisz kamień",this);

    }
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienta zamiast przez SELECT z db
     * @dataItem connectedRepository.items[i]
     */
    makeItem(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";
        return {
            id: dataItem.id,
            //icon:   'info',
            $title: this.makeTitle(dataItem),
            $description: this.makeDescription(dataItem),
            editUrl: dataItem.editUrl,
            dataItem: dataItem
        };
    }

    /*
     * @param {dataItem} this.connectedRepository.items[i])
     */
    makeTitle(dataItem) {
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem._case._parent._parent.number + ' ' + dataItem._case._type.folderNumber + ' ' + dataItem._case._type.name + ' ' + dataItem.name,
            dataItem,
            new InputTextField(this.id + '_' + dataItem.id + '_tmpNameEdit_TextField', 'Edytuj', undefined, true, 150),
            'name',
            this);
        return titleAtomicEditLabel.$dom;
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        if (!dataItem.description)
            dataItem.description = '';

        var $collectionElementDescription = $('<span>');
        var $footer = $('<span class="comment">');
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br><span>');

        var deadlineLabel = '';
        if (dataItem.deadline) {
            deadlineLabel = 'Wykonać do: ' + dataItem.deadline + '&#9889;';
            $footer.append(deadlineLabel);
        }

        var ownerLabel = '';
        if (dataItem._owner) {
            ownerLabel = 'Przypisane do:&nbsp;' + dataItem._owner.name + '&nbsp;' + dataItem._owner.surname;
            $footer.append(' ' + ownerLabel);
        }

        $collectionElementDescription
            .append($footer);
        return $collectionElementDescription;
    }

    makeList() {
        return super.makeList().filter((item) => {
            return item.dataItem._parent.id == this.parentDataItem.id;
        });
    }

    selectTrigger(itemId) {
        super.selectTrigger(itemId);
    }
}