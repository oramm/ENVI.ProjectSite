class RolesCollection extends SimpleCollection {
    constructor(initParamObject) {
        super({
            id: initParamObject.id,
            parentDataItem: initParamObject.parentDataItem,
            title: "Role",
            addNewModal: initParamObject.addNewModal,
            editModal: initParamObject.editModal,
            isPlain: true,
            hasFilter: false,
            isEditable: true,
            isAddable: true,
            isDeletable: true,
            connectedRepository: RolesSetup.rolesRepository
        });

        this.initialise(this.makeList());
    }

    makeItem(dataItem) {
        return {
            id: dataItem.id,
            icon: 'person',
            $title: this.makeTitle(dataItem),
            $description: $('<span>').html(dataItem.description),
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
        return titleAtomicEditLabel.$dom
    }
    /*
     * @param {dataItem} this.connectedRepository.currentItem
     */
    makeDescription(dataItem) {
        (dataItem.description) ? true : dataItem.description = "";

        var $collectionElementDescription = $('<span>');
        var descriptionAtomicEditLabel = new AtomicEditLabel(dataItem.description,
            dataItem,
            new ReachTextArea(this.id + '_' + dataItem.id + '_tmpDescriptionReachTextArea', 'Opis', true, 500),
            'description',
            this);

        $collectionElementDescription
            .append(descriptionAtomicEditLabel.$dom)

        return $collectionElementDescription;
    }

    makeList() {
        return super.makeList().filter((item) => item.dataItem.groupName == this.parentDataItem.name);
    }
}