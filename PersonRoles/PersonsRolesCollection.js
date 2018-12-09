class PersonsRolesCollection extends SimpleCollection {
    constructor(id){
        super({id: id, 
               title: 'Role w Projekcie',
               isPlain: false, 
               hasFilter: false,
               isEditable: true, 
               isAddable: true, 
               isDeletable: true,
               connectedRepository: personRoleAssociationsRepository
              });
        
        this.addNewModal = new PersonsRolesAssociationModal('newPersonsRolesAssociation', 'Przypisz rolę', this, 'ADD_NEW');
        
        this.initialise(this.makeList());        
    }
    
    makeItem(dataItem){
        return {    id: '' + dataItem.personId + dataItem.roleId,
                    icon:   'person',
                    title:  dataItem.personName + ' ' + 
                            dataItem.personSurname + ': ' +
                            dataItem.entityName,
                    description:    dataItem.roleName + '<BR>' +
                                    '<a href="callto:'+ dataItem.personPhone +'">' +dataItem.personPhone + '</a> ' +
                                    '<a href="mailto:'+ dataItem.personEmail +'">' + dataItem.personEmail + '</a>'
                };
    }
}