class PersonsRolesCollection extends SimpleCollection {
    constructor(id){
        super(id, personRoleAssociationsRepository);
        
        this.$addNewModal = new NewPersonsRolesAssociationModal('newPersonsRolesAssociation', 'Przypisz rolę', this);
        //this.$editModal = new EditExternalAchievementModal('editExternalAchievement', 'Edytuj osiągnięcie', this);
        
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