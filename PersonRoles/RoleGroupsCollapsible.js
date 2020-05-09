class RoleGroupsCollapsible extends SimpleCollapsible {
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
        this.addNewRoleModal = new RoleModal(this.id + '_newRoleModal', 'Dodaj rolę', this, 'ADD_NEW');
        this.editRoleModal = new RoleModal(this.id + '_editRoleModal', 'Edytuj rolę', this, 'EDIT');
        
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem, $bodyDom) {
        var editModal;
        editModal = this.editRoleModal;
        return {
            id: dataItem.id,
            name: dataItem.name,
            $body: $bodyDom,
            dataItem: dataItem,
            editModal: editModal,
            subitemsCount: RolesSetup.rolesRepository.items.filter(item => item._group.name == dataItem.id).length
        };
    }

    makeBodyDom(dataItem) {
        var $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .append(new RolesCollection({
                id: 'rolesCollection_' + dataItem.id,
                parentDataItem: dataItem,
                addNewModal: this.addNewRoleModal,
                editModal: this.editRoleModal
            }).$dom)
        return $panel;
    }
}