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
        MainSetup.personsRepositoryLocalData = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
        );

        MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository('PersonsPerProject repository',
            'getPersonsNameSurnameEmailListPerSystemRole',
        );
        MainSetup.entitiesRepositoryLocalData = new SimpleRepository(
            'Entities repository',
            'getEntitiesList',
        );

        MainSetup.personsRepositoryLocalData.initialise();
        MainSetup.personsPerProjectRepositoryLocalData.initialise('ENVI_EMPLOYEE|ENVI_MANAGER');
        MainSetup.entitiesRepositoryLocalData.initialise();
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

