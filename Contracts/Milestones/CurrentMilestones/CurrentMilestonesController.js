class CurrentMilestonesController {
    main() {
        // Hide auth UI, then load client library.
        var currentMilestonesView = new CurrentMilestonesView();
        $("#authorize-div").hide();
        currentMilestonesView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        MilestonesSetup.milestonesRepository = new SimpleRepository('Milestones repository',
            'getCurrentMilestonesList',
            'addNewMilestone',
            'editMilestone',
            'deleteMilestone');
        MilestonesSetup.milestoneTypesRepository = new SimpleRepository('MilestoneTypes repository',
            'getMilestoneTypesList',
            'addNewMilestoneType',
            'editMilestoneType',
            'deleteMilestoneType');

        var promises = [
            MilestonesSetup.milestonesRepository.initialise(),
            MilestonesSetup.milestoneTypesRepository.initialise(),
        ];
        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                currentMilestonesView.initialise();
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
            });

    }
}

