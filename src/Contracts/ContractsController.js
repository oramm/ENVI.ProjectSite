class ContractsController {
    static main() {
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        MilestonesSetup.milestonesRepository = new SimpleRepository({
            name: 'Milestones repository',
            actionsNodeJSSetup: { addNewRoute: 'Milestone', editRoute: 'Milestone', deleteRoute: 'Milestone' },
        });


        ContractsSetup.contractsRepository = new SimpleRepository({
            name: 'Contracts repository',
            actionsNodeJSSetup: { addNewRoute: 'Contract', editRoute: 'Contract', deleteRoute: 'Contract' },
        });

        MilestonesSetup.milestoneTypesRepository = new SimpleRepository({
            name: 'MilestoneTypes repository'
        });

        ContractsSetup.otherContractsRepository = new SimpleRepository({
            name: 'Other contracts repository'
        });

        const promises = [
            MilestonesSetup.milestonesRepository.initialiseNodeJS('milestones/?projectId=' + milestonesRepository.parentItemId),
            ContractsSetup.contractsRepository.initialiseNodeJS(`contracts/?projectId=${contractsRepository.parentItemId}&isArchived=true`),
            MilestonesSetup.milestoneTypesRepository.initialiseNodeJS('milestoneTypes/?projectId=' + contractsRepository.parentItemId),
        ];

        Promise.all(promises)
            .then(() => ContractsSetup.otherContractsRepository.items = Array.from(contractsRepository.items))
            .then(() => {
                console.log("Repositories initialised");
                contractsListView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
                iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
            }
            )
            .catch(err => {
                console.error(err);
            });

    }
}