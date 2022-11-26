"use strict";
var RolesController = /** @class */ (function () {
    function RolesController() {
    }
    RolesController.main = function () {
        // Hide auth UI, then load client library.
        var rolesView = new RolesView();
        $("#authorize-div").hide();
        rolesView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        RolesSetup.roleGroupsRepository = new StaticRepository({
            name: 'RoleGroups repository',
            items: RolesSetup.groups
        });
        RolesSetup.rolesRepository = new SimpleRepository('Roles repository', 'getRolesPerProjectList', 'addNewRole', 'editRole', 'deleteRole');
        var promises = [
            RolesSetup.rolesRepository.initialiseNodeJS('roles/?projectId=' + MainSetup.currentProject.ourId)
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
        })
            .then(function (res) {
            console.log(res);
            rolesView.initialise();
        })
            .then(function () {
            ReachTextArea.reachTextAreaInit();
            $('.modal').modal();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return RolesController;
}());
