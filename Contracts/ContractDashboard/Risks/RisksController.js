class RisksController {
    main(){
        // Hide auth UI, then load client library.
        var risksListView = new RisksListView();
        var promises = [];
        $("#authorize-div").hide();
        risksListView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        RisksSetup.risksRepository = new SimpleRepository(  'Risks repository',
                                                            'getRisksListPerProject',
                                                            'addNewRisk',
                                                            'editRisk',
                                                            'deleteRisk');
        
        RisksSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
                                                                'getRisksReactionsListPerContract',
                                                                'addNewTask',
                                                                'editTask',
                                                                'deleteTask');
        
        RisksSetup.casesRepository = new SimpleRepository(  'Cases repository',
                                                            'getCasesListPerContract',
                                                            'addNewCase',
                                                            'editCase',
                                                            'deleteCase'); 
                
        RisksSetup.personsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
        RisksSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        RisksSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));

        
        
        promises[0] = RisksSetup.reactionsRepository.initialise(RisksSetup.reactionsRepository.parentItemId);
        promises[1] = RisksSetup.risksRepository.initialise({projectOurId: RisksSetup.contractsRepository.parentItemId});
        promises[2] = RisksSetup.casesRepository.initialise(RisksSetup.casesRepository.parentItemId);
        
        
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

