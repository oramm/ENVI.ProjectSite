class PersonsRolesAssociationsView extends Popup {
    constructor(){
        super();
        this.associationsCollectionItems = [];
        this.associationsModal = new Modal('associationsModal',this, this.addNewAssociationTrigger);
        this.peronsRolesCollection;
    }
    
    initialise(){
        this.setTittle(projectId + ": Zespół");
        this.setAssociationsCollectionItems();
        this.peronsRolesCollection = new Collection('peronsRolesCollection', $('#results'), 
                                                    this.associationsCollectionItems, 
                                                    this, 
                                                    this.removeAssociationHandler);
        
        this.associationsModal.init();
        this.associationsModal.setTittle("Przypisz role dla Projektu " + projectId);
        
        //actionsMenu init
        this.actionsMenuInitialise();
        
        var optionsRadioButtons = FormTools.createRadioButtons("roleId", rolesRepository);
        this.associationsModal.appendUiElement(optionsRadioButtons[0].outerHTML)
            .then(  $('[name^="roleId"]').click(function() {
                    rolesRepository.selectedItemId = $(this).val();
                    })
                 );
        var personTextField = FormTools.createAutoCompleteTextField();
        this.associationsModal.appendUiElement(personTextField[0].outerHTML);
        var autocomplete = new AutoComplete(personsRepository,"email", this.onProjectChosen, this);

        var submitButton = FormTools.createSubmitButton("Przypisz");
        this.associationsModal.appendUiElement(submitButton[0].outerHTML);
        
        this.dataLoaded(true);
        console.log("PersonsRolesAssociationsView initialised");
    }
    
    actionsMenuInitialise(){
        this.associationsModal.preppendTriggerButtonTo("actionsMenu","Przypisz role");
        var newPersonButton = FormTools.createFlatButton('Dodaj osobę', ()=> window.open("https://docs.google.com/forms/d/e/1FAIpQLSehVk9CjuyN2gDiUEPtyjeDv4_7stMVfYe5kK7F3oCYbqhP3A/viewform",'_blank'));
        $('#actionsMenu').append(newPersonButton);
        var newRoleButton = FormTools.createFlatButton('Dodaj rolę', ()=> window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1NROAMQLaeHNKBrLiSApvLNXwvglL-MCVdsIG0_arnWV6uw/viewform?usp=pp_url&entry.1609292475='+rolesRepository.selectedProjectId+'&entry.355770471&entry.804066860','_blank'));
        $('#actionsMenu').append(newRoleButton);
    }
    
    setAssociationsCollectionItems(){
        this.associationsCollectionItems = [];
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
            this.associationsCollectionItems.push(item);
            }
    }

     removeAssociationHandler(assciationId){
        var association = search(assciationId,"id",rolesRepository.personRolesAssociations);
        rolesRepository.unasoosciatePersonRole(association, this.peronsRolesCollection.removeHandler,this.peronsRolesCollection)
            .catch(err => {
                      console.error(err);
                    });
    }

    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodowania
    */
    addNewAssociationTrigger(){
        rolesRepository.newPersonRoleAssociated();
        var association = rolesRepository.newPersonRoleAssociation;
        var isReallyNew = !$('#' + association.id).length; 
        if(isReallyNew){
            rolesRepository.addNewPersonRoleAssociation(association, this.addNewAssociationHandler, this);
        } else {
            alert("Wybrana rola już została wcześniej przypisana!")
        }
    }

    /*
     * Krok 2 -  callback z repository - obsługuje wyświetlanie podczas łączenia z serwerem 
     * przekaż proces do obiektu 'Collection' i obsłuż w zależności od statusu odpowiedzi z serwera
     * Krok 3 jest w obiekcie Collection.addNewHandler
    */
    addNewAssociationHandler(status, collectionItem, errorMessage){
            var collectionItem = {   id: rolesRepository.newPersonRoleAssociation.id,
                                     icon: 'person',
                                     title: rolesRepository.newPersonRoleAssociation.person.name + ' ' + 
                                     rolesRepository.newPersonRoleAssociation.person.surname,
                                     description:    rolesRepository.newPersonRoleAssociation.role.name + '<BR>' +
                                                     '<a href="callto:'+ rolesRepository.newPersonRoleAssociation.person.phone +'">' +rolesRepository.newPersonRoleAssociation.person.phone + '</a> ' +
                                                     '<a href="mailto:'+ rolesRepository.newPersonRoleAssociation.person.email +'">' + rolesRepository.newPersonRoleAssociation.person.email + '</a>'
                                 };

            this.peronsRolesCollection.addNewHandler(status, collectionItem, errorMessage);
            
    } 
}