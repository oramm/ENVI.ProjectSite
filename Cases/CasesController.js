class CasesController {
    main(){
        // Hide auth UI, then load client library.
        var casesListView = new CasesListView();
        $("#authorize-div").hide();
        casesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        tasksRepository = new TasksRepository();
        casesRepository = new CasesRepository();
        
        var promises = [];
        promises[0] = tasksRepository.initialise();
        promises[1] = casesRepository.initialise();
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            casesListView.initialise();
                        })            
            .catch(err => {
                  console.error(err);
                });
   
    }
}

