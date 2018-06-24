class PersonsRolesAssociationView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        return new Promise((resolve, reject) => {
            this.personsRolesCollection = new PersonsRolesCollection('personsRolesCollection');
            this.setTittle("Lista kontaktowa");

            $('#actionsMenu').after(this.personsRolesCollection.$dom);
            this.dataLoaded(true);
            resolve('personsRolesCollection ok');
        });
    }
    
    
    actionsMenuInitialise(){
    }
}