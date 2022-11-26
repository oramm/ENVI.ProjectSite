"use strict";
var ProcessesController = /** @class */ (function () {
    function ProcessesController() {
    }
    ProcessesController.main = function () {
        // Hide auth UI, then load client library.
        var listView = new ProcessesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        ProcessesSetup.processesRepository = new SimpleRepository({
            name: 'Processes repository',
            actionsNodeJSSetup: { addNewRoute: 'Process', editRoute: 'Process', deleteRoute: 'Process' },
        });
        ProcessesSetup.processStepsRepository = new SimpleRepository({
            name: 'ProcessSteps repository',
            actionsNodeJSSetup: { addNewRoute: 'ProcessStep', editRoute: 'ProcessStep', deleteRoute: 'ProcessStep' },
        });
        ProcessesSetup.caseTypesRepository = new SimpleRepository({
            name: 'CaseTypes repository',
            actionsNodeJSSetup: { addNewRoute: 'CaseType', editRoute: 'CaseType', deleteRoute: 'CaseType' },
        });
        ProcessesSetup.documentTemplatesRepository = new SimpleRepository({
            name: 'DocumentTemplates repository',
            actionsNodeJSSetup: { addNewRoute: 'DocumentTemplate', editRoute: 'DocumentTemplate', deleteRoute: 'DocumentTemplate' },
        });
        var promises = [
            ProcessesSetup.processesRepository.initialiseNodeJS("Processes/?status=ACTIVE"),
            ProcessesSetup.processStepsRepository.initialiseNodeJS('ProcessSteps/'),
            ProcessesSetup.caseTypesRepository.initialiseNodeJS("caseTypes/"),
            ProcessesSetup.documentTemplatesRepository.initialiseNodeJS('documentTemplates/')
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            listView.initialise();
        })
            .then(function () {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
            $('ul.tabs').tabs();
            iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return ProcessesController;
}());
