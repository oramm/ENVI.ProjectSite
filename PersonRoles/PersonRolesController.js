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
        promises[0] = rolesRepository.initialise(rolesRepository.parentItemId);
        promises[1] = personsRepository.initialise();
        promises[2] = personRoleAssociationsRepository.initialise(personRoleAssociationsRepository.parentItemId);
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            //return rolesRepository.makePersonRoleAssociations();
                        })
            .then((res)=>   {    console.log(res); 
                                personsRolesAssociationView.initialise();
                            })
            .then(() =>     {   $('select').material_select();
                                $('.modal').modal();
                                Materialize.updateTextFields();
                            })
            .catch(err => {
                  console.error(err);
                });
   
    }
}

