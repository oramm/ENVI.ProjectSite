class ProjectDetailsController {
    static main() {
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        ProcessesInstancesSetup.processesInstancesRepository = new SimpleRepository({
            name: 'ProcessesInstantces repository'
        });

        ProcessesInstancesSetup.processesStepsInstancesRepository = new SimpleRepository(undefined, 'ProcessesStepsInstances repository',
            '',
            'editProcessStepInstance');


        CasesSetup.casesRepository = new SimpleRepository({ name: 'Cases repository' });

        LettersSetup.lettersRepository = new SimpleRepository(undefined, 'Letters repository',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.casesRepository = CasesSetup.casesRepository;

        var promises = [
            ProcessesInstancesSetup.processesInstancesRepository.initialiseNodeJS('processInstances/?projectId=' + MainSetup.currentProject.ourId),
            ProcessesInstancesSetup.processesStepsInstancesRepository.initialiseNodeJS(`processStepInstances/?projectId=${MainSetup.currentProject.ourId}`),
            CasesSetup.casesRepository.initialiseNodeJS(`cases/?projectId=${MainSetup.currentProject.ourId}&hasProcesses=true`),
            LettersSetup.lettersRepository.initialiseNodeJS('letters/?projectId=' + MainSetup.currentProject.ourId),
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
            });
    }
}