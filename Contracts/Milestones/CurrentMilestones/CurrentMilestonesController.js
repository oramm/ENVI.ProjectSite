class CurrentMilestonesController {
    main(){
        // Hide auth UI, then load client library.
        var currentMilestonesView = new CurrentMilestonesView();
        $("#authorize-div").hide();
        currentMilestonesView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        milestonesRepository = new SimpleRepository('Milestones repository',
                                                    'getCurrentMilestonesList',
                                                    'addNewMilestone',
                                                    'editMilestone',
                                                    'deleteMilestone');
        

        var promises = [];
        promises[0] = milestonesRepository.initialise();
        //promises[1] = contractsRepository.initialise(contractsRepository.parentItemId);
        //promises[2] = personsRepository.initialise('ENVI_EMPLOYEE');
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            currentMilestonesView.initialise();
                        })
            .then(  ()=>{   $('select').material_select();
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
                });
   
    }
}
