class MainController {
    static async main() {
        try {
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
            MainSetup.contractTypesRepositoryLocalData = new SimpleRepository({
                name: 'ContractTypes repository'
            });
            MainSetup.caseTypesRepositoryLocaData = new SimpleRepository({
                name: 'CaseTypes repository'
            });

            MainSetup.personsRepositoryLocalData = new SimpleRepository({
                name: 'Persons repository'
            });

            //inicjowana po wyborze projketu w MainWindowView.onProjectChosen
            MainSetup.personsPerProjectRepositoryLocalData = new SimpleRepository({
                name: 'PersonsPerProject repository'
            });

            MainSetup.personsEnviRepositoryLocalData = new SimpleRepository({
                name: 'PersonsEnvi repository'
            });

            MainSetup.entitiesRepositoryLocalData = new SimpleRepository({
                name: 'Entities repository',
            });

            MainSetup.documentTemplatesRepositoryLocalData = new SimpleRepository({
                name: 'DocumentTemplates repository'
            });


            MainSetup.personsRepositoryLocalData.initialiseNodeJS('persons/');

            MainSetup.personsEnviRepositoryLocalData.initialiseNodeJS('persons/?systemRoleName=ENVI_EMPLOYEE|ENVI_MANAGER');
            MainSetup.entitiesRepositoryLocalData.initialiseNodeJS('entities/');
            MainSetup.documentTemplatesRepositoryLocalData.initialiseNodeJS('documentTemplates/');
            MainSetup.contractTypesRepositoryLocalData.initialiseNodeJS('contractTypes/?status=ACTIVE');
            MainSetup.projectsRepositoryLocalData.initialiseNodeJS('projects/' + MainSetup.currentUser.systemEmail)
                .then(() => {

                    console.log("Projects initialised");
                    mainWindowView.initialise();
                    mainWindowView.dataLoaded(true);
                    iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
                })
                .catch(err => {
                    console.error(err);
                });

        } catch (error) {
            console.error(error);
            alert(error.message || error);
        }

    }
}