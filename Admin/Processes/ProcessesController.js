class ProcessesController {
    main(){
        // Hide auth UI, then load client library.
        var listView = new ProcessesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        ProcessesSetup.processesRepository = new SimpleRepository('Processes repository',
                                                                   'getProcessesList',
                                                                   'addNewProcess',
                                                                    'editProcess',
                                                                    'deleteProcess');
        
        ProcessesSetup.processStepsRepository = new SimpleRepository(   'ProcessSteps repository',
                                                                        'getProcessStepsList',
                                                                        'addNewProcessStep',
                                                                        'editProcessStep',
                                                                        'deleteProcessStep');
        
        
        
        ProcessesSetup.caseTypesRepository = new SimpleRepository(  'CaseTypes repository',
                                                                    'getCaseTypesList',
                                                                    'addNewCaseType',
                                                                    'editCaseType',
                                                                    'deleteCaseType'
                                                                   );
        var promises = [];
        promises[0] = ProcessesSetup.processesRepository.initialise({status: 'ACTIVE'});
        promises[1] = ProcessesSetup.processStepsRepository.initialise();
        promises[2] = ProcessesSetup.caseTypesRepository.initialise();
        
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
                            $('ul.tabs').tabs();
                            iFrameResize({log:false, heightCalculationMethod:'taggedElement', checkOrigin:false});
                        }
            )
            .catch(err => {
                  console.error(err);
                });
   
    }
}