"use strict";
var ProjectDetailsController = /** @class */ (function () {
    function ProjectDetailsController() {
    }
    ProjectDetailsController.main = function () {
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        ProcessesInstancesSetup.processesInstancesRepository = new SimpleRepository('ProcessesInstantces repository');
        ProcessesInstancesSetup.processesStepsInstancesRepository = new SimpleRepository('ProcessesStepsInstances repository', '', 'editProcessStepInstance');
        CasesSetup.casesRepository = new SimpleRepository('Cases repository');
        LettersSetup.lettersRepository = new SimpleRepository('Letters repository', 'addNewLetter', 'editLetter', 'deleteLetter');
        LettersSetup.casesRepository = CasesSetup.casesRepository;
        var promises = [
            ProcessesInstancesSetup.processesInstancesRepository.initialiseNodeJS('processInstances/?projectId=' + MainSetup.currentProject.ourId),
            ProcessesInstancesSetup.processesStepsInstancesRepository.initialiseNodeJS("processStepInstances/?projectId=" + MainSetup.currentProject.ourId),
            CasesSetup.casesRepository.initialiseNodeJS("cases/?projectId=" + MainSetup.currentProject.ourId + "&hasProcesses=true"),
            LettersSetup.lettersRepository.initialiseNodeJS('letters/?projectId=' + MainSetup.currentProject.ourId),
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            projectDetailsView.initialise();
        })
            .then(function () {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
        });
    };
    return ProjectDetailsController;
}());
