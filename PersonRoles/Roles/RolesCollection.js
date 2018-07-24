class RolesCollection extends SimpleCollection {
    constructor(id){
        super(id, rolesRepository);
        
        this.$addNewModal = new NewRoleModal(this.id + '_newRoleModal', 'Dodaj rolę', this);
        this.$editModal = new EditRoleModal(this.id + '_editRoleModal', 'Edytuj role', this);
        
        this.initialise(this.makeList());        
    }
    
    makeItem(dataItem){
        return {    id: dataItem.id,
                    icon:   'person',
                    title:  dataItem.name,
                    description:    dataItem.description.replace(/\n/g, "<br />")
                };
    }
}