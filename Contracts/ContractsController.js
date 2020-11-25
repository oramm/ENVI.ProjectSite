class ContractsController {
    main() {
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        MilestonesSetup.milestonesRepository = new SimpleRepository('Milestones repository',
            'getMilestonesList',
            'addNewMilestone',
            'editMilestone',
            'deleteMilestone'
        );

        ContractsSetup.contractsRepository = new SimpleRepository('Contracts repository',
            'getContractsList',
            'addNewContract',
            'editContract',
            'deleteContract'
        );

        MilestonesSetup.milestoneTypesRepository = new SimpleRepository('MilestoneTypes repository',
            'getMilestoneTypesList'
        );

        ContractsSetup.otherContractsRepository = new SimpleRepository('Other contracts repository');

        var promises = [
            milestonesRepository.initialise({ projectId: milestonesRepository.parentItemId }),
            contractsRepository.initialise({ projectId: contractsRepository.parentItemId }),
            MilestonesSetup.milestoneTypesRepository.initialise(contractsRepository.parentItemId),
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