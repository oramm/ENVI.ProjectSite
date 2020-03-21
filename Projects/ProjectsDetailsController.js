class ProjectDetailsController {
    main() {
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        personsRepository = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
        );

        ProjectsSetup.entitiesRepository = new SimpleRepository(
            'Entities repository',
            'getEntitiesList',
        );
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
            'getLettersListPerProject',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.personsRepository = personsRepository;
        LettersSetup.casesRepository = CasesSetup.casesRepository

        LettersSetup.documentTemplatesRepository = new SimpleRepository('DocumentTemplates repository',
            'getDocumentTemplatesList',
        );

        LettersSetup.entitiesRepository = ProjectsSetup.entitiesRepository;

        var promises = [];
        promises[0] = ProjectsSetup.entitiesRepository.initialise();
        promises[1] = personsRepository.initialise('ENVI_EMPLOYEE|ENVI_MANAGER');
        promises[2] = ProcessesInstancesSetup.processesInstancesRepository.initialise({ projectId: ProjectsSetup.projectsRepository.currentItem.ourId });
        promises[3] = ProcessesInstancesSetup.processesStepsInstancesRepository.initialise(ProjectsSetup.projectsRepository.currentItem.ourId);
        promises[4] = CasesSetup.casesRepository.initialise({ projectId: ProjectsSetup.projectsRepository.currentItem.ourId });
        promises[5] = LettersSetup.documentTemplatesRepository.initialise();
        promises[6] = LettersSetup.lettersRepository.initialise({ projectId: ProjectsSetup.projectsRepository.currentItem.ourId });

        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                projectDetailsView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate({
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 15, // Creates a dropdown of 15 years to control year,
                    monthsFull: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
                    monthsShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
                    weekdaysFull: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
                    weekdaysShort: ['niedz.', 'pn.', 'wt.', 'śr.', 'cz.', 'pt.', 'sob.'],
                    firstDay: 1,
                    today: 'Dzisiaj',
                    clear: 'Wyszyść',
                    close: 'Ok',
                    closeOnSelect: false, // Close upon selecting a date,
                    container: undefined, // ex. 'body' will append picker to body
                    format: 'dd-mm-yyyy',
                    formatSubmit: 'yyyy-mm-dd'
                });
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
            }
            )
    }
}

