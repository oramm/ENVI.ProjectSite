class StepsCollection extends SimpleCollection {
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
            connectedRepository: ProcessesSetup.processStepsRepository
        });
        this.initialise(this.makeList());

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
        var titleAtomicEditLabel = new AtomicEditLabel(dataItem.name,
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
        (dataItem.description) ? true : dataItem.description = "";

        var $collectionElementDescription = $('<span>');
        if (dataItem.description)
            $collectionElementDescription.append('<span>' + dataItem.description + '<br></span>');

        return $collectionElementDescription;
    }

    makeList() {
        return super.makeList().filter((item) => {
            return item.dataItem._parent.id == this.parentDataItem.id;
        });
    }
}