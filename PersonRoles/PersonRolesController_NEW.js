class PersonsRolesController {
    main(){
        // Hide auth UI, then load client library.
        var personsRolesAssociationView = new PersonsRolesAssociationView();
        $("#authorize-div").hide();
        personsRolesAssociationView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        rolesRepository = new RolesRepository();
        personsRepository = new PersonsRepository();
        
        var promises = [];
        promises[0] = rolesRepository.initialise();
        promises[1] = personsRepository.initialise();
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            return rolesRepository.makePersonRoleAssociations();
                        })
            .then((res)=>  {   console.log(res); 
                                personsRolesAssociationView.initialise()
                        })
            .catch(err => {
                  console.error(err);
                });
   
    }
}

