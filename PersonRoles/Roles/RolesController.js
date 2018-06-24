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
        var currentProjectId = getUrlVars()["itemId"];
        promises[0] = rolesRepository.initialise(currentProjectId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            //return rolesRepository.makePersonRoleAssociations();
                        })
            .then((res)=>   {   console.log(res); 
                                rolesView.initialise();
                            })
            .catch(err => {
                  console.error(err);
                });
   
    }
}

