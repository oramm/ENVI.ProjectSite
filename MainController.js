class MainController {
    main() {
        // Hide auth UI, then load client library.
        mainWindowView = new MainWindowView();
        mainWindowView.loadIframe("iframeMain", 'Dashboard/dashboard.html');
        $("#authorize-div").hide();
        mainWindowView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        MainSetup.projectsRepositoryLocalData = new SimpleRepository({
            name: 'Projects repository',
            actionsNodeJSSetup: { addNewRoute: 'project', editRoute: 'project', deleteRoute: 'project' },
        });
        MainSetup.contractTypesRepositoryLocalData = new SimpleRepository('ContractTypes repository'
        );
        MainSetup.caseTypesRepositoryLocaData = new SimpleRepository('CaseTypes repository',
            'addNewCaseType',
            'editCaseType',
            'deleteCaseType'
        );

        MainSetup.personsRepositoryLocalData = new SimpleRepository('Persons repository',
            'addNewPersonInDb',
            'editPersonInDb',
            'deletePerson'
        );

        //inicjowana po wyborze projketu w MainWindowView.onProjectChosen
        MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository('PersonsPerProject repository'
        );

        MainSetup.personsEnviRepositoryLocalData = new SimpleRepository('PersonsEnvi repository'
        );

        MainSetup.entitiesRepositoryLocalData = new SimpleRepository(
            'Entities repository',
            'addNewEntityInDb',
            'editEntityInDb',
            'deleteEntity'
        );

        MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository('DocumentTemplates repository'
        );


        MainSetup.personsRepositoryLocalData.initialiseNodeJS('persons/');

        MainSetup.personsEnviRepositoryLocalData.initialiseNodeJS('persons/?systemRoleName=ENVI_EMPLOYEE|ENVI_MANAGER');
        MainSetup.entitiesRepositoryLocalData.initialiseNodeJS('entities/');
        MainSetup.documentTemplatesRepositoryLocalData.initialiseNodeJS('documentTemplates/');
        MainSetup.contractTypesRepositoryLocalData.initialiseNodeJS('contractTypes/?status=ACTIVE');
        console.log(gAuth.userEmail);
        MainSetup.projectsRepositoryLocalData.initialiseNodeJS('projects/' + gAuth.userEmail)
            .then(() => {
                sessionStorage.setItem('Current User', JSON.stringify({
                    name: gAuth.userName,
                    surname: '',
                    systemEmail: gAuth.userEmail,
                    googleImage: gAuth.userGoogleImage
                })
                );

                console.log("Projects initialised");
                mainWindowView.initialise();
                mainWindowView.dataLoaded(true);
                iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
            })
            .catch(err => {
                console.error(err);
            });
    }
}