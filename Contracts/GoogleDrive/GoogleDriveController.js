class GoogleDriveController {
    main(){
        // Hide auth UI, then load client library.
        var gantView = new GoogleDriveView();
        $("#authorize-div").hide();
        gantView.dataLoaded(false);
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
      
        var promises = [];
        promises[0] = milestonesRepository.initialise(milestonesRepository.parentItemId);
        promises[1] = contractsRepository.initialise(contractsRepository.parentItemId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            gantView.initialise();
                            iFrameResize({log:false, heightCalculationMethod:'max', minHeight:500, checkOrigin:false});
                        })
            .catch(err => {
                  console.error(err);
                });
   
    }
}

