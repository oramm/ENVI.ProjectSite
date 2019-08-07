class ContractsController {
    main(){
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        MilestonesSetup.milestonesRepository = new SimpleRepository('Milestones repository',
                                                    'getMilestonesListPerProject',
                                                    'addNewMilestone',
                                                    'editMilestone',
                                                    'deleteMilestone');
        
        ContractsSetup.contractTypesRepository = new SimpleRepository('ContractTypes repository',
                                                                            'getContractTypesList');
                                                                            
        ContractsSetup.contractsRepository = new SimpleRepository(  'Contracts repository',
                                                                    'getContractsListPerProject',
                                                                    'addNewContract',
                                                                    'editContract',
                                                                    'deleteContract');
        
        ContractsSetup.personsRepository = new SimpleRepository('Persons repository',
                                                                'getPersonsNameSurnameEmailList',
                                                                );
        
        
        MilestonesSetup.milestoneTypesRepository = new SimpleRepository('MilestoneTypes repository',
                                                                        'getMilestoneTypesList'
                                                                       );
                                                                                         
        ContractsSetup.otherContractsRepository = new SimpleRepository('Other contracts repository');

        var promises = [];
        promises[0] = ContractsSetup.contractTypesRepository.initialise('ACTIVE');
        promises[1] = milestonesRepository.initialise({projectId: milestonesRepository.parentItemId});
        promises[2] = contractsRepository.initialise({projectId: contractsRepository.parentItemId});
        promises[3] = personsRepository.initialise('ENVI_EMPLOYEE|ENVI_MANAGER');
        promises[4] = MilestonesSetup.milestoneTypesRepository.initialise(contractsRepository.parentItemId);
        
        Promise.all(promises)
            .then(()=>ContractsSetup.otherContractsRepository.items = Array.from(contractsRepository.items))
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
                            iFrameResize({log:false, heightCalculationMethod:'taggedElement', checkOrigin:false});
                        }
            )
            .catch(err => {
                  console.error(err);
                });
   
    }
}