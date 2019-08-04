class TaskTemplatesController {
    main(){
        // Hide auth UI, then load client library.
        var listView = new TaskTemplatesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        TaskTemplatesSetup.taskTemplatesRepository = new SimpleRepository(  'TaskTemplates repository',
                                                                            'getTaskTemplatesListPerCaseTemplate',
                                                                            'addNewTaskTemplate',
                                                                            'editTaskTemplate',
                                                                            'deleteTaskTemplate');
        
       
        var promises = [];
        
        promises[0] = TaskTemplatesSetup.taskTemplatesRepository.initialise(TaskTemplatesSetup.currentCaseTemplate.id);
                                                                      
        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            listView.initialise();
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
                alert('Wystąpił bład. Zgłoś go administratorowi systemu: \n' + 
                      err
                      );
            });
   
    }
}