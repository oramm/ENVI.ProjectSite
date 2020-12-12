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
            'getTasksList',
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
            'getLettersList',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.milestonesRepository = CasesSetup.casesRepository
        LettersSetup.casesRepository = CasesSetup.casesRepository;

        var promises = [
            tasksRepository.initialiseNodeJS('tasks/?milestoneId=' + tasksRepository.parentItemId),
            CasesSetup.casesRepository.initialiseNodeJS('cases/?milestoneId=' + casesRepository.parentItemId),
            CasesSetup.caseTypesRepository.initialiseNodeJS('caseTypes/?milestoneId=' + CasesSetup.caseTypesRepository.parentItemId),
            ProcessesInstancesSetup.processesStepsInstancesRepository.initialiseNodeJS('processStepInstances/?milestoneId=' + CasesSetup.casesRepository.parentItemId),
            CasesSetup.eventsRepository.initialiseNodeJS('caseEvents/?milestoneId='+ CasesSetup.casesRepository.parentItemId),
            LettersSetup.lettersRepository.initialiseNodeJS('letters/?milestoneId=' + LettersSetup.lettersRepository.parentItemId)
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