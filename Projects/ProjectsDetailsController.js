class ProjectDetailsController {
    main() {
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        ProcessesInstancesSetup.processesInstancesRepository = new SimpleRepository(
            'ProcessesInstantces repository',
            'getProcessInstancesList'
        );

        ProcessesInstancesSetup.processesStepsInstancesRepository = new SimpleRepository('ProcessesStepsInstances repository',
            'getProcessesStepsInstancesListPerProject',
            '',
            'editProcessStepInstance');


        CasesSetup.casesRepository = new SimpleRepository('Cases repository',
            'getCasesListPerProject');

        LettersSetup.lettersRepository = new SimpleRepository('Letters repository',
            'getLettersList',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.casesRepository = CasesSetup.casesRepository;

        var promises = [
            ProcessesInstancesSetup.processesInstancesRepository.initialise({ projectId: MainSetup.currentProject.ourId }),
            ProcessesInstancesSetup.processesStepsInstancesRepository.initialise(MainSetup.currentProject.ourId),
            CasesSetup.casesRepository.initialise({ projectId: MainSetup.currentProject.ourId }),
            LettersSetup.lettersRepository.initialise({ projectId: MainSetup.currentProject.ourId }),
        ];
        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                projectDetailsView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
            }
            )
    }
}

