class CasesController {
    main() {
        // Hide auth UI, then load client library.
        var casesListView = new CasesListView();
        $("#authorize-div").hide();
        casesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        CasesSetup.casesRepository = new SimpleRepository('Cases repository',
            'getCasesListPerMilestone',
            'addNewCase',
            'editCase',
            'deleteCase');

        tasksRepository = new SimpleRepository('Tasks repository',
            'getTasksListPerMilestone',
            'addNewTask',
            'editTask',
            'deleteTask');

        caseTypesRepository = new SimpleRepository('CaseTypes repository',
            'getCaseTypesListPerMilestone');

        ProcessesInstancesSetup.processesStepsInstancesRepository = new SimpleRepository('ProcessesStepsInstances repository',
            'getProcessesStepsInstancesListPerMilestone',
            '',
            'editProcessStepInstance');

        CasesSetup.eventsRepository = new SimpleRepository('CaseEvents repository',
            'getCaseEventsListPerMilestone');

        LettersSetup.lettersRepository = new SimpleRepository('Letters repository',
            'getLettersListPerProject',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.casesRepository = CasesSetup.casesRepository;

        var promises = [
            tasksRepository.initialise(tasksRepository.parentItemId),
            CasesSetup.casesRepository.initialise(casesRepository.parentItemId),
            CasesSetup.caseTypesRepository.initialise(CasesSetup.caseTypesRepository.parentItemId),
            ProcessesInstancesSetup.processesStepsInstancesRepository.initialise(CasesSetup.casesRepository.parentItemId),
            CasesSetup.eventsRepository.initialise(CasesSetup.casesRepository.parentItemId),
            LettersSetup.lettersRepository.initialise({ milestoneId: LettersSetup.lettersRepository.parentItemId })
        ]
        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                casesListView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
            }
            )
            .catch(err => {
                console.error(err);
                alert('Wystąpił bład. Zgłoś go administratorowi systemu: \n' +
                    err
                );
            });

    }
}