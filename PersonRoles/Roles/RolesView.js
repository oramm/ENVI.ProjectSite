class RolesView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        return new Promise((resolve, reject) => {
            this.setTittle("Role w projekcie");
            //var $orgChart = $('<div id="orgchart">')
            $('#actionsMenu')
                .after(new RoleGroupsCollapsible('roleGroupsCollapsible').$dom)
                //.after($orgChart)

            //var orgchart = new OrgChart({
            //    parentNode: $orgChart[0],
            //    connectedRepository: RolesSetup.rolesRepository
           //})
            this.dataLoaded(true);
            resolve('rolesCollection ok');
        });
    }

    actionsMenuInitialise() {
    }
}