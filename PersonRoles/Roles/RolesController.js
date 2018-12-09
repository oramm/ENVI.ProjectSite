class RolesController {
    main(){
        // Hide auth UI, then load client library.
        var rolesView = new RolesView();
        $("#authorize-div").hide();
        rolesView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        //rolesRepository = new RolesRepository();
        //personsRepository = new PersonsRepository();
        rolesRepository = new SimpleRepository  ('Roles repository',
                                                 'getRolesPerProjectList',
                                                 'addNewRoleInDb',
                                                 'editRoleInDb',
                                                 'deleteRole'
                                                );

        var promises = [];
        promises[0] = rolesRepository.initialise(rolesRepository.parentItemId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            //return rolesRepository.makePersonRoleAssociations();
                        })
            .then((res)=>   {   console.log(res); 
                                rolesView.initialise();
                            })
            .then(()=>  {   ReachTextArea.reachTextAreaInit();
                            $('.modal').modal();
                        })
            .catch(err => {
                  console.error(err);
                });  
    }
}