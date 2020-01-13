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

        personsRepository = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
        );

        caseTypesRepository = new SimpleRepository('CaseTypes repository',
            'getCaseTypesListPerMilestone');

        CasesSetup.processesStepsInstancesRepository = new SimpleRepository('ProcessesStepsInstances repository',
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

        LettersSetup.personsRepository = personsRepository;
        LettersSetup.casesRepository = CasesSetup.casesRepository

        LettersSetup.documentTemplatesRepository = new SimpleRepository('DocumentTemplates repository',
            'getDocumentTemplatesList',
        );

        LettersSetup.entitiesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Entities repository')));

        var promises = [];

        promises[0] = tasksRepository.initialise(tasksRepository.parentItemId);
        promises[1] = CasesSetup.casesRepository.initialise(casesRepository.parentItemId);
        promises[2] = personsRepository.initialise('ENVI_EMPLOYEE|ENVI_MANAGER');
        promises[3] = CasesSetup.caseTypesRepository.initialise(CasesSetup.caseTypesRepository.parentItemId);
        promises[4] = CasesSetup.processesStepsInstancesRepository.initialise(CasesSetup.casesRepository.parentItemId);
        promises[5] = CasesSetup.eventsRepository.initialise(CasesSetup.casesRepository.parentItemId);
        promises[6] = LettersSetup.documentTemplatesRepository.initialise();
        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                casesListView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15, // Creates a dropdown of 15 years to control year,
                    today: 'Dzisiaj',
                    clear: 'Wyszyść',
                    close: 'Ok',
                    closeOnSelect: false, // Close upon selecting a date,
                    container: undefined, // ex. 'body' will append picker to body
                    format: 'dd-mm-yyyy'
                });
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