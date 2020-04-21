class PersonRoleGroupsCollapsible extends SimpleCollapsible {
    constructor(id) {
        super({
            id: id,
            hasFilter: false,
            isEditable: false,
            isAddable: false,
            isDeletable: false,
            hasArchiveSwitch: false,
            connectedRepository: RolesSetup.roleGroupsRepository
            //subitemsCount: 12
        });
        this.addNewPersonsRolesAssociationModal = new PersonsRolesAssociationModal('newPersonsRolesAssociation', 'Przypisz rolę', this, 'ADD_NEW');
        
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom) {
        return {
            id: dataItem.id,
            name: dataItem.name,
            $body: $bodyDom,
            dataItem: dataItem,
            subitemsCount: PersonsSetup.personRoleAssociationsRepository.items.filter(item => item._role._group.name == dataItem.id).length
        };
    }

    makeBodyDom(dataItem) {
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .append(new PersonsRolesCollection({
                id: 'personsRolesCollection_' + dataItem.id,
                parentDataItem: dataItem,
                addNewModal: this.addNewPersonsRolesAssociationModal,
                editModal: this.editRoleModal
            }).$dom)
        return $panel;
    }
}