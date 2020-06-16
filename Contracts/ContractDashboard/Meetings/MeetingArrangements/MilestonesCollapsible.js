class MilestonesCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: true,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: false,
            connectedRepository: MeetingsSetup.milestonesRepository
            //subitemsCount: 12
        });

        this.initialise(this.makeCollapsibleItemsList());

    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom) {
        var name = dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name;
        return {
            id: dataItem.id,
            name: name,
            $body: $bodyDom,
            dataItem: dataItem,
        };
    }


    makeBodyDom(dataItem) {
        var casesCollection = new CasesCollection({
            id: 'casesListCollection_' + dataItem.id,
            title: '',
            parentDataItem: dataItem
        })
        return casesCollection.$dom;
    }

}