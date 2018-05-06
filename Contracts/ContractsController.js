class ContractsController {
    main(){
        // Hide auth UI, then load client library.
        var contractsListView = new ContractsListView();
        $("#authorize-div").hide();
        contractsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        milestonesRepository = new MilestonesRepository();
        contractsRepository = new ContractsRepository();
        
        var promises = [];
        promises[0] = milestonesRepository.initialise();
        promises[1] = contractsRepository.initialise();
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            contractsListView.initialise();
                        })            
            .catch(err => {
                  console.error(err);
                });
   
    }
}

