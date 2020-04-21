class PersonsRolesAssociationView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        return new Promise((resolve, reject) => {
            this.personRoleGroupsCollapsible = new PersonRoleGroupsCollapsible('personRoleGroupsCollapsible');
            this.setTittle("Lista kontaktowa");

            $('#actionsMenu').after(this.personRoleGroupsCollapsible.$dom);
            this.dataLoaded(true);
            resolve('personRoleGroupsCollapsible ok');
        });
    }
    
    
    actionsMenuInitialise(){
    }
}