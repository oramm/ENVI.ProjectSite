class PersonsRolesCollection extends Collection {
    constructor(id, projectId){
        super();
        this.projectId = projectId;
        this.initialise(id,this.makeList());
    }
    
    makeList(){
        var itemsList = [];
        var item;
        for (var i=0; i<rolesRepository.personRolesAssociations.length; i++){
            item = {    id: rolesRepository.personRolesAssociations[i].id,
                        icon:   'person',
                        title:  rolesRepository.personRolesAssociations[i].person.name + ' ' + 
                                rolesRepository.personRolesAssociations[i].person.surname + ': ' +
                                rolesRepository.personRolesAssociations[i].person.company,
                        description:    rolesRepository.personRolesAssociations[i].role.name + '<BR>' +
                                        '<a href="callto:'+ rolesRepository.personRolesAssociations[i].person.phone +'">' +rolesRepository.personRolesAssociations[i].person.phone + '</a> ' +
                                        '<a href="mailto:'+ rolesRepository.personRolesAssociations[i].person.email +'">' + rolesRepository.personRolesAssociations[i].person.email + '</a>'
                    };
            itemsList.push(item);
            }
        return itemsList;
    }
    
    /*
     * Krok 3 -  callback z repository - obsługuje wyświetlanie podczas łączenia z serwerem 
     * przekaż proces do obiektu 'Collection' i obsłuż w zależności od statusu odpowiedzi z serwera
     * Krok 3 jest w obiekcie Collection.addNewHandler
    */
    addNewHandler(status, errorMessage){
        var collectionItem = {   id: rolesRepository.newPersonRoleAssociation.id,
                                 icon: 'person',
                                 title: rolesRepository.newPersonRoleAssociation.person.name + ' ' + 
                                 rolesRepository.newPersonRoleAssociation.person.surname,
                                 description:    rolesRepository.newPersonRoleAssociation.role.name + '<BR>' +
                                                 '<a href="callto:'+ rolesRepository.newPersonRoleAssociation.person.phone +'">' +rolesRepository.newPersonRoleAssociation.person.phone + '</a> ' +
                                                 '<a href="mailto:'+ rolesRepository.newPersonRoleAssociation.person.email +'">' + rolesRepository.newPersonRoleAssociation.person.email + '</a>'
                             };

        super.addNewHandler(status, collectionItem, errorMessage);
        //this.addNewHandler.apply(this,[status, collectionItem, errorMessage]);            
    } 
    
    /*
     * Krok 1 - po kliknięciu w przycisk 'usuń' 
     * Proces: this.removeTrigger >> rolesRepository.unasoosciatePersonRole 
     *                                      >> repository.deleteItem >> collection.removeHandler[PENDING]
     *                                      >> repository.deleteItem >> collection.removeHandler[DONE]

     */
    removeTrigger(itemId){
        var association = search(itemId,"id",rolesRepository.personRolesAssociations);
        //rolesRepository.unasoosciatePersonRole(association, this.removeHandler,this)
        rolesRepository.unasoosciatePersonRole(association, this)
            .catch(err => {
                      console.error(err);
                    });
    }
    
    selectTrigger(itemId){
    }
    
}