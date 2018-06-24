class ContractsController {
    main(){
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        milestonesRepository = new SimpleRepository('Milestones repository',
                                                    'getMilestonesListPerProject',
                                                    'addNewMilestoneInDb',
                                                    'editMilestoneInDb',
                                                    'deleteMilestone');
        
        contractsRepository = new SimpleRepository('Contracts repository',
                                                    'getContractsListPerProject',
                                                    'addContractInDb',
                                                    'editContractInDb',
                                                    'deleteContract');
        
        var promises = [];
        promises[0] = milestonesRepository.initialise(milestonesRepository.currentProjectId);
        promises[1] = contractsRepository.initialise(contractsRepository.currentProjectId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            contractsListView.initialise();
                        })            
            .catch(err => {
                  console.error(err);
                });
   
    }
}

