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
        var phoneLabel = (dataItem._person.phone)?'tel.: <a href="tel:'+ dataItem._person.phone +'">' +dataItem._person.phone + '</a> ' : '';
        var cellphoneLabel = (dataItem._person.cellphone)? 'kom.: <a href="tel:'+ dataItem._person.cellphone +'">' +dataItem._person.cellphone + '</a> ': '';
        var mailLabel = (dataItem._person.email)? 'mail: <a href="mailto:'+ dataItem._person.email +'">' + dataItem._person.email + '</a>' : '';
        
        return {    id: '' + dataItem._person.id + dataItem._role.id,
                    icon:   'person',
                    title:  dataItem._person.name + ' ' + 
                            dataItem._person.surname + ': ' +
                            dataItem._person.entityName,
                    description:    dataItem._role.name + '<BR>' +
                                    cellphoneLabel +
                                    phoneLabel +
                                    mailLabel,
                    dataItem: dataItem
                };
    }
}