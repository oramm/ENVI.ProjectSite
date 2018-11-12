class PersonRoleAssociation {
        /* 
         * @person {Person} - musi być ustawiony przy dodwaniu nowego rekordu
         * @role {Role} - musi być ustawiony przy dodwaniu nowego rekordu 
         * Konstruktor nie wymaga ww. parametrów
         */
        constructor(roleId, personId){
        this.id = '' + personId + roleId;
        this.roleId = roleId;
        this.personId = personId;
        this.person = search(personId,"id",personsRepository.items);
        this.role = search(roleId,"id",rolesRepository.items);
        
    }
}

class RolesRepository extends Repository{
    constructor(){
        super('Roles repository');
        this.personRolesAssociationsRaw; //raw data as it comes from Db
        this.newPersonRoleAssociation = {};
        this.personRolesAssociations = []; //data proccessed by makePersonRoleAssociations 
        this.selectedProjectId = getUrlVars()["projectId"];
    }
    
     /*
     * Calls an Apps Script function to get the data from the Google Sheet
     */
    initialise() {
        return new Promise((resolve, reject) => {
            this.doServerFunction('getRolesPerProjectList', this.selectedProjectId)
                .then((result) =>   { this.items = result
                                      resolve;
                                    })
                .then(() => this.doServerFunction('getPersonRoleAssociationsPerProject', this.selectedProjectId))
                .then((result) => { this.personRolesAssociationsRaw = result;
                                    resolve("Roles initialised");
                                 });
        });
    }
    /*
     * Wywowyływana w PersonsRolesController po zainicjowaniu obu repozytoriów
     * musi tak być , bo klasa korzysta z danych PersonsRepository
     */ 
    makePersonRoleAssociations(){
        return new Promise((resolve, reject) => {
            var ass;
            for(var i=0; i<this.personRolesAssociationsRaw.length;i++){
                ass = new PersonRoleAssociation(this.personRolesAssociationsRaw[i].roleId, this.personRolesAssociationsRaw[i].personId);
                this.personRolesAssociations.push(ass);
            }
            resolve('makePersonRoleAssociations() done');
        });
    }

    /*
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Collection
     */
    unasoosciatePersonRole(personRoleAssociation,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(personRoleAssociation,'unasoosciateRole', viewObject)
                    .then (()=> {   this.personRolesAssociations = this.personRolesAssociations
                                        .filter(function(item){return item.id!==personRoleAssociation.id});
                                    console.log(this.personRolesAssociations);
                                    resolve('PersonRole association deleted');
                                });
        });
    }
 
    newPersonRoleAssociated() {
        this.newPersonRoleAssociation = new PersonRoleAssociation(parseInt(this.selectedItemId), 
                                                                  personsRepository.selectedItem.id);
    }
    
    //Krok 2 - wywoływana przy SUBMIT
    addNewPersonRoleAssociation(personRoleAssociation, viewObject) {
        return new Promise((resolve, reject) => {
            this.addNewItem(personRoleAssociation,'setPersonRoleAssociation',viewObject)
                  .then((res) => {  this.personRolesAssociations.push(personRoleAssociation)
                                    console.log(this.personRolesAssociations);
                                 });
        });
    }
}