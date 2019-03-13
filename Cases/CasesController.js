class CasesController {
    main(){
        // Hide auth UI, then load client library.
        var casesListView = new CasesListView();
        $("#authorize-div").hide();
        casesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        casesRepository = new SimpleRepository('Cases repository',
                                                    'getCasesListPerMilestone',
                                                    'addNewCase',
                                                    'editCase',
                                                    'deleteCase');
        
        tasksRepository = new SimpleRepository('Tasks repository',
                                                    'getTasksListPerMilestone',
                                                    'addNewTask',
                                                    'editTask',
                                                    'deleteTask');
        
        personsRepository = new SimpleRepository('Persons repository',
                                                    'getPersonsNameSurnameEmailList',
                                                );
        caseTypesRepository = new SimpleRepository('CaseeTypes repository',
                                                        'getCaseTypesList');
        var promises = [];
        
        promises[0] = tasksRepository.initialise(tasksRepository.parentItemId);
        promises[1] = casesRepository.initialise(casesRepository.parentItemId);
        promises[2] = personsRepository.initialise('ENVI_EMPLOYEE|ENVI_MANAGER');
        promises[3] = CasesSetup.caseTypesRepository.initialise(CasesSetup.caseTypesRepository.parentItemId);
        
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            casesListView.initialise();
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