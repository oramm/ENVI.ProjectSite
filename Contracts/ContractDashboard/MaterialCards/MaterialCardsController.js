class MaterialCardsController {
    main(){
        // Hide auth UI, then load client library.
        var materialCardsListView = new MaterialCardsListView();
        $("#authorize-div").hide();
        materialCardsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        MaterialCardsSetup.materialCardsRepository = new SimpleRepository(  'MaterialCards repository',
                                                                            'getMaterialCardsListPerContract',
                                                                            'addNewMaterialCard',
                                                                            'editMaterialCard',
                                                                            'deleteMaterialCard');
        
        //MaterialCardsSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
                //                                                        'getMaterialCardsReactionsListPerProject',
                //                                                        'addNewMaterialCardReaction',
                //                                                        'ediMaterialCardtReaction',
                //                                                        'deleteMaterialCardReaction');
        
        MaterialCardsSetup.personsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
        MaterialCardsSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        MaterialCardsSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));
        
        var promises = [];
        
        //promises[0] = MaterialCardsSetup.reactionsRepository.initialise(MaterialCardsSetup.reactionsRepository.parentItemId);
        promises[0] = MaterialCardsSetup.materialCardsRepository.initialise(MaterialCardsSetup.materialCardsRepository.parentItemId);
        //promises[1] = MaterialCardsSetup.personsRepository.initialise();

        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            materialCardsListView.initialise();
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

