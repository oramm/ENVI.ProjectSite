class PersonsRolesController {
    main(){
        // Hide auth UI, then load client library.
        var personsRolesAssociationView = new PersonsRolesAssociationView();
        $("#authorize-div").hide();
        personsRolesAssociationView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        //rolesRepository = new RolesRepository();
        //personsRepository = new PersonsRepository();
        rolesRepository = new SimpleRepository  ('Roles repository',
                                                 'getRolesPerProjectList',
                                                 'addNewRoleInDb',
                                                 'editRoleInDb',
                                                 'deleteRole'
                                                );
        personRoleAssociationsRepository = new PersonsRolesRepository('PersonsRolesAssociations repository',
                                                                'getPersonRoleAssociationsPerProject',
                                                                'addNewPersonRoleAssociationInDb',
                                                                'editPersonRoleAssociationInDb',
                                                                'deletePersonRoleAssociation',
                                                                'fillNewPersonRoleAssociationData'
                                                               );
        personsRepository = new SimpleRepository('Persons repository',
                                                 'getPersonsNameSurnameEmailList',
                                                 'addNewPersonInDb',
                                                 'editPersonInDb',
                                                 'deletePerson'
                                                );
        var promises = [];
        var currentProjectId = getUrlVars()["itemId"];
        promises[0] = rolesRepository.initialise(currentProjectId);
        promises[1] = personsRepository.initialise();
        promises[2] = personRoleAssociationsRepository.initialise(currentProjectId);
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            //return rolesRepository.makePersonRoleAssociations();
                        })
            .then((res)=>   {    console.log(res); 
                                personsRolesAssociationView.initialise();
                            })
            .then(() =>     {   $('select').material_select();
                                $('.modal').modal();
                            })
            .catch(err => {
                  console.error(err);
                });
   
    }
}

