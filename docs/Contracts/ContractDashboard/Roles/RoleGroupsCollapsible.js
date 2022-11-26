"use strict";
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
        this.addNewModal = new RoleModal(this.id + '_newRoleModal', 'Dodaj rolę', this, 'ADD_NEW');
        this.editModal = new RoleModal(this.id + '_editRoleModal', 'Edytuj rolę', this, 'EDIT');
        this.initialise(this.makeCollapsibleItemsList());
    }
    /*
     * Przetwarza surowe dane z repozytorium na item gotowy dla Collapsible.buildRow()
     * @param {type} connectedRepository.items[i]
     * @returns {Collapsible.Item}
     */
    makeItem(dataItem) {
        return super.makeItem(dataItem);
    }
    makeBody(dataItem) {
        let subCollection = new RolesCollection({
            id: 'rolesCollection_' + dataItem.id,
            parentDataItem: dataItem,
            addNewModal: this.addNewModal,
            editModal: this.editModal
        });
        let $panel = $('<div>')
            .attr('id', 'collapsibleBody' + dataItem.id)
            .append(subCollection.$dom);
        return {
            collection: subCollection,
            $dom: $panel
        };
    }
}
