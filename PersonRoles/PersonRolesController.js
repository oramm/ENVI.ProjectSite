class PersonsRolesController {
    main() {
        // Hide auth UI, then load client library.
        var personsRolesAssociationView = new PersonsRolesAssociationView();
        $("#authorize-div").hide();
        personsRolesAssociationView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        RolesSetup.roleGroupsRepository = new StaticRepository({
            name: 'RoleGroups repository',
            items: RolesSetup.groups
        });

        RolesSetup.rolesRepository = new SimpleRepository('Roles repository',
            'getRolesPerProjectList',
            'addNewRoleInDb',
            'editRoleInDb',
            'deleteRole'
        );
        PersonsSetup.personRoleAssociationsRepository = new SimpleRepository('PersonsRolesAssociations repository',
            'getPersonRoleAssociationsPerProject',
            'addNewPersonRoleAssociationInDb',
            'editPersonRoleAssociationInDb',
            'deletePersonRoleAssociation'
        );
        PersonsSetup.personsRepository = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
            'addNewPersonInDb',
            'editPersonInDb',
            'deletePerson'
        );
        var promises = [];
        promises[0] = RolesSetup.rolesRepository.initialise({ projectOurId: RolesSetup.rolesRepository.parentItemId });
        promises[1] = PersonsSetup.personsRepository.initialise();
        promises[2] = PersonsSetup.personRoleAssociationsRepository.initialise({ projectOurId: PersonsSetup.personRoleAssociationsRepository.parentItemId });

        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
            })
            .then((res) => {
                console.log(res);
                personsRolesAssociationView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                Materialize.updateTextFields();
            })
            .catch(err => {
                console.error(err);
            });

    }
}

