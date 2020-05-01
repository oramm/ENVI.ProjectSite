class ProcessesController {
    main() {
        // Hide auth UI, then load client library.
        var listView = new ProcessesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';


        ProcessesSetup.processesRepository = new SimpleRepository('Processes repository',
            'getProcessesList',
            'addNewProcess',
            'editProcess',
            'deleteProcess');

        ProcessesSetup.processStepsRepository = new SimpleRepository('ProcessSteps repository',
            'getProcessStepsList',
            'addNewProcessStep',
            'editProcessStep',
            'deleteProcessStep');



        ProcessesSetup.caseTypesRepository = new SimpleRepository('CaseTypes repository',
            'getCaseTypesList',
            'addNewCaseType',
            'editCaseType',
            'deleteCaseType'
        );

        var promises = [
            ProcessesSetup.processesRepository.initialise({ status: 'ACTIVE' }),
            ProcessesSetup.processStepsRepository.initialise(),
            ProcessesSetup.caseTypesRepository.initialise()
        ];
        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                listView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
                $('ul.tabs').tabs();
                iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
            }
            )
            .catch(err => {
                console.error(err);
            });

    }
}