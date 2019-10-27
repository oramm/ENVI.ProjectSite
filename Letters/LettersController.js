class LettersController {
    main(){
        // Hide auth UI, then load client library.
        var listView = new LettersListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
       
        LettersSetup.lettersRepository = new SimpleRepository('Letters repository',
                                                                'getLettersListPerProject',
                                                                'addNewLetter',
                                                                'editLetter',
                                                                'deleteLetter');
        
        LettersSetup.contractsRepository = new SimpleRepository(   'Contracts repository',
                                                                   'getContractsListPerProject'
                                                                );
                                                       
        LettersSetup.milestonesRepository = new SimpleRepository(   'Milestones repository',
                                                                    'getMilestonesListPerProject'
                                                                );
                                                       
        LettersSetup.casesRepository = new SimpleRepository(   'Cases repository',
                                                               'getCasesListPerProject'
                                                            );
        LettersSetup.caseTypesRepository = new SimpleRepository('CaseTypes repository',
                                                                'getCaseTypesList');
                                                    
        LettersSetup.personsRepository = new SimpleRepository('Persons repository',
                                                              'getPersonsNameSurnameEmailList',
                                                             );
        LettersSetup.documentTemplatesRepository = new SimpleRepository('DocumentTemplates repository',
                                                                      'getDocumentTemplatesList',
                                                                     );
        LettersSetup.entitiesRepository = new SimpleRepository('Entities repository',
                                                                'getEntitiesList',
                                                                );
        var promises = [];
        promises[0] = LettersSetup.lettersRepository.initialise({projectId: LettersSetup.lettersRepository.parentItemId});
        promises[1] = LettersSetup.contractsRepository.initialise({projectId: LettersSetup.lettersRepository.parentItemId});
        promises[2] = LettersSetup.milestonesRepository.initialise({projectId: LettersSetup.lettersRepository.parentItemId});
        promises[3] = LettersSetup.casesRepository.initialise({projectId: LettersSetup.lettersRepository.parentItemId});
        promises[4] = LettersSetup.caseTypesRepository.initialise();
        promises[5] = LettersSetup.personsRepository.initialise({projectId: LettersSetup.lettersRepository.parentItemId});
        promises[6] = LettersSetup.documentTemplatesRepository.initialise();
        promises[7] = LettersSetup.entitiesRepository.initialise();
        
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