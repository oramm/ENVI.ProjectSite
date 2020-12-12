class RolesController {
    main() {
        // Hide auth UI, then load client library.
        var rolesView = new RolesView();
        $("#authorize-div").hide();
        rolesView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        RolesSetup.roleGroupsRepository = new StaticRepository({
            name: 'RoleGroups repository',
            items: RolesSetup.groups
        });

        RolesSetup.rolesRepository = new SimpleRepository('Roles repository',
            'getRolesPerProjectList',
            'addNewRole',
            'editRole',
            'deleteRole'
        );

        var promises = [
            RolesSetup.rolesRepository.initialiseNodeJS('roles/?projectId=' + RolesSetup.rolesRepository.parentItemId )
        ];
    Promise.all(promises)
            .then(() => {
    console.log("Repositories initialised");
})
            .then((res) => {
    console.log(res);
    rolesView.initialise();
})
    .then(() => {
        ReachTextArea.reachTextAreaInit();
        $('.modal').modal();
    })
    .catch(err => {
        console.error(err);
    });
    }
}