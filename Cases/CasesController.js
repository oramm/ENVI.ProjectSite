class CasesController {
    main(){
        // Hide auth UI, then load client library.
        var casesListView = new CasesListView();
        $("#authorize-div").hide();
        casesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        //tasksRepository = new TasksRepository();
        //casesRepository = new CasesRepository();
        
        casesRepository = new SimpleRepository('Tasks repository',
                                                    'getCasesListPerProject',
                                                    'addNewCaseInDb',
                                                    'editCaseInDb',
                                                    'deleteCase');
        
        tasksRepository = new SimpleRepository('Cases repository',
                                                    'getTasksListPerProject',
                                                    'addTaskInDb',
                                                    'editTaskInDb',
                                                    'deleteTask');
        
        var promises = [];
        
        promises[0] = tasksRepository.initialise(tasksRepository.currentProjectId);
        promises[1] = casesRepository.initialise(casesRepository.currentProjectId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            casesListView.initialise();
                        })            
            .catch(err => {
                  console.error(err);
                });
   
    }
}

