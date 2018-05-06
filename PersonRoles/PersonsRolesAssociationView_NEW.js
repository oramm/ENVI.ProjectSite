class PersonsRolesAssociationView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        this.personsRolesCollection = new PersonsRolesCollection('personsRolesCollection');
        this.setTittle("Role w projekcie");
        this.associationsModal = new PersonRolesAssociationsModal('associationsModal',this.personsRolesCollection, this.personsRolesCollection.addNewHandler);
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(this.personsRolesCollection.$dom);
        this.dataLoaded(true);
    }
    
    actionsMenuInitialise(){
        this.associationsModal.preppendTriggerButtonTo("actionsMenu","Przypisz role");
        var newPersonButton = FormTools.createFlatButton('Dodaj osobę', ()=> window.open("https://docs.google.com/forms/d/e/1FAIpQLSehVk9CjuyN2gDiUEPtyjeDv4_7stMVfYe5kK7F3oCYbqhP3A/viewform",'_blank'));
        $('#actionsMenu').append(newPersonButton);
        var newRoleButton = FormTools.createFlatButton('Dodaj rolę', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1NROAMQLaeHNKBrLiSApvLNXwvglL-MCVdsIG0_arnWV6uw/viewform?usp=pp_url&entry.1609292475='+rolesRepository.selectedProjectId+'&entry.355770471&entry.804066860','_blank'));
        $('#actionsMenu').append(newRoleButton);
    }
}