class RisksController {
    main(){
        // Hide auth UI, then load client library.
        var risksListView = new RisksListView();
        $("#authorize-div").hide();
        risksListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        RisksSetup.risksRepository = new SimpleRepository(  'Risks repository',
                                                            'getRisksListPerProject',
                                                            'addNewRisk',
                                                            'editRisk',
                                                            'deleteRisk');
        
        RisksSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
                                                                'getRisksReactionsListPerProject',
                                                                'addNewRiskReaction',
                                                                'ediRisktReaction',
                                                                'deleteRiskReaction');
        RisksSetup.personsRepository = new SimpleRepository('Persons repository',
                                                    'getPersonsNameSurnameEmailList',
                                                );
        
        RisksSetup.contractsRepository = new SimpleRepository('Contracts repository',
                                                            'getContractsKeyDataListPerProject',
                                                            );
        RisksSetup.milestonesRepository = new SimpleRepository('Milestones repository',
                                                            'getMilestonesListPerProject',
                                                            );
        
        var promises = [];
        
        promises[0] = RisksSetup.reactionsRepository.initialise(RisksSetup.reactionsRepository.parentItemId);
        promises[1] = RisksSetup.risksRepository.initialise(RisksSetup.risksRepository.parentItemId);
        promises[2] = RisksSetup.contractsRepository.initialise(RisksSetup.risksRepository.parentItemId);
        promises[3] = personsRepository.initialise();
        promises[4] = RisksSetup.milestonesRepository.initialise(RisksSetup.milestonesRepository.parentItemId);
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            risksListView.initialise();
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

