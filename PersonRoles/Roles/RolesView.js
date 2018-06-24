class RolesView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        return new Promise((resolve, reject) => {
            this.rolesCollection = new RolesCollection('rolesCollection');
            this.setTittle("Role w projekcie");

            $('#actionsMenu').after(this.rolesCollection.$dom);
            this.dataLoaded(true);
            resolve('rolesCollection ok');
        });
    }
    
    actionsMenuInitialise(){
    }
}