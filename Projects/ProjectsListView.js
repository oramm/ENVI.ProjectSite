class ProjectListView extends Popup {
    constructor(){
        super();
        this.q = 0;

    }
    initialise(){
        this.setTittle("Lista projektów");
        this.printProjecstList("#results");
        this.dataLoaded(true);
        this.setSubmitAction();
        var autocomplete = new AutoComplete(projectsRepository.items);
        console.log("ProjectListView initialised");
    }

    setSubmitAction() {
        $("#foo").submit((event) => {
            this.addNew();
            // prevent default posting of form
            event.preventDefault();
        });
    }
    
    submitHandler(){
        return new Promise((resolve, reject) => {

        });
    }

    printProjecstList(HTMLElementId){
        $(HTMLElementId).append('<ul id="personRoleAssociations" class="collection"></ul>');
        for (var i=0; i<rolesRepository.personRolesAssociations.length; i++){
            this.append(rolesRepository.personRolesAssociations[i]);
        }
    }
    
    addNew(){
        rolesRepository.newPersonRoleAssociated();
        var association = rolesRepository.newPersonRoleAssociation;
        var isReallyNew = !$(this.getHTMLId(association)).length 
        if(isReallyNew){
            rolesRepository.addNewPersonRoleAssociation(association, this.addNewHandler, this);
        } else {
            alert("Wybrana rola już została wcześniej przypisana!")
        }
    }
    
    //funkcja wywoływana w rolesRepository potrzebny trik z appplu dla callbacka
    addNewHandler(status,association, errorMessage){
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    this.hidePreloader(".progress");
                    break;
                case "PENDING":
                    this.showPreloader("#results");
                    this.append(rolesRepository.newPersonRoleAssociation);
                    break;
                case "ERROR":
                    alert(errorMessage);
                    $(this.getHTMLId(association)).remove();
                    this.hidePreloader(".progress");
                    break;
                }
            resolve(status)
        });
    }

    remove(association, associationHTMLId){
        rolesRepository.unasoosciatePersonRole(association, this.removeHandler,this)
            .catch(err => {
                      console.error(err);
                    });
    }

    //funkcja wywoływana w rolesRepository.unasoosciatePersonRole potrzebny trik z appplu dla callbacka
    removeHandler(status,association, errorMessage){
        return new Promise((resolve, reject) => {
            switch (status) {
                case "DONE":
                    $(this.getHTMLId(association)).remove();
                    break;
                case "PENDING":
                    $(this.getHTMLId(association)).append('<span class="new badge red" data-badge-caption="">kasuję...</span>');
                    break;
                case "ERROR":
                    alert(errorMessage);
                    break;
                }
            resolve(status);
        });
    }
    
    //-------------------------------------- funkcje prywatne -----------------------------------------------------
    append(association){
            var person = search(association.personId,"dbId",personsRepository.items);
            var role = search(association.roleId,"id",rolesRepository.items); 
            $('#personRoleAssociations').append('<li class="collection-item" id="'+ this.setHTMLId(association) + '">' +
                                    '<div >' + person.name + ' ' + person.surname + ' ma rolę: ' + role.name +
                                        '<a onclick=\'personsRolesAssociationsView.remove(' + JSON.stringify(association) + ');\' class="itemDelete secondary-content"><i class="material-icons">delete</i></a>' + 
                                    '</div>' + 
                               '</li>');
    }

    setHTMLId(association){
        return 'personsRoleAssociation' + association.personId + association.roleId;
    }

    getHTMLId(association){
        return '#' +  this.setHTMLId(association);
    } 
}