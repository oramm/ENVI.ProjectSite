class RolesController {
    static main() {
        // Hide auth UI, then load client library.
        var rolesView = new RolesView();
        $("#authorize-div").hide();
        rolesView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        RolesSetup.roleGroupsRepository = new StaticRepository({
            name: 'RoleGroups repository',
            items: RolesSetup.groups
        });

        RolesSetup.rolesRepository = new SimpleRepository({
            name: 'Roles repository',
            actionsNodeJSSetup: { addNewRoute: 'Role', editRoute: 'Role', deleteRoute: 'Role' },
        });

        var promises = [
            RolesSetup.rolesRepository.initialiseNodeJS('roles/?projectId=' + MainSetup.currentProject.ourId)
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