class RolesView extends Popup {
    constructor() {
        super();
    }
    initialise() {
        return new Promise((resolve, reject) => {
            this.setTittle("Role w projekcie");
            //var $orgChart = $('<div id="orgchart">')
            var entityRawPanel = new RawPanel({
                id: 'newEntityRawPanel',
                connectedRepository: MainSetup.entitiesRepository
            });
            entityRawPanel.initialise(new EntityModal('newEntityModal', 'Dodaj podmiot', entityRawPanel, 'ADD_NEW'));

            var personRawPanel = new RawPanel({
                id: 'newPersonRawPanel',
                connectedRepository: MainSetup.personsRepository
            });
            personRawPanel.initialise(new PersonModal('newPersonModal', 'Dodaj osobę', personRawPanel, 'ADD_NEW'));
            entityRawPanel.$dom.addClass('col l1');
            personRawPanel.$dom.addClass('col l1');
            $('#actionsMenu')
                .append(entityRawPanel.$dom)
                .append(personRawPanel.$dom)
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