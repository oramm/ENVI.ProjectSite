class MainController {
    main() {
        // Hide auth UI, then load client library.
        mainWindowView = new MainWindowView();
        mainWindowView.loadIframe("iframeMain", 'Dashboard/dashboard.html');
        $("#authorize-div").hide();
        mainWindowView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        MainSetup.projectsRepositoryLocalData = new SimpleRepository('Projects repository',
            'getProjectsList',
            'addNewProject',
            'editProject'
        );
        MainSetup.contractTypesRepositoryLocalData = new SimpleRepository('ContractTypes repository',
            'getContractTypesList'
        );
        MainSetup.caseTypesRepositoryLocaData = new SimpleRepository('CaseTypes repository',
            'getCaseTypesListPerMilestoneType',
            'addNewCaseType',
            'editCaseType',
            'deleteCaseType'
        );

        MainSetup.personsRepositoryLocalData = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
        );

        //inicjowana po wyborze projketu w MainWindowView.onProjectChosen
        MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository('PersonsPerProject repository',
            'getPersonsNameSurnameEmailListPerProject',
        );

        MainSetup.personsEnviRepositoryLocalData = new SimpleRepository('PersonsEnvi repository',
            'getPersonsNameSurnameEmailListEnvi',
        );

        MainSetup.entitiesRepositoryLocalData = new SimpleRepository(
            'Entities repository',
            'getEntitiesList',
        );

        MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository('DocumentTemplates repository',
            'getDocumentTemplatesList',
        );


        MainSetup.personsRepositoryLocalData.initialise();

        MainSetup.personsEnviRepositoryLocalData.initialise();
        MainSetup.entitiesRepositoryLocalData.initialise();
        MainSetup.documentTemplatesRepositoryLocalData.initialise();
        MainSetup.contractTypesRepositoryLocalData.initialise('ACTIVE');
        MainSetup.projectsRepositoryLocalData.initialise(gAuth.userEmail)
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