class ContractsController {
    main(){
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        milestonesRepository = new SimpleRepository('Milestones repository',
                                                    'getMilestonesListPerProject',
                                                    'addNewMilestone',
                                                    'editMilestone',
                                                    'deleteMilestone');
        
        contractsRepository = new SimpleRepository('Contracts repository',
                                                    'getContractsListPerProject',
                                                    'addNewContract',
                                                    'editContract',
                                                    'deleteContract');
        personsRepository = new SimpleRepository('Persons repository',
                                                    'getPersonsNameSurnameEmailList',
                                                );
        
        var promises = [];
        promises[0] = milestonesRepository.initialise(milestonesRepository.parentItemId);
        promises[1] = contractsRepository.initialise(contractsRepository.parentItemId);
        promises[2] = personsRepository.initialise();
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            contractsListView.initialise();
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

