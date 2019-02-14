class IssuesController {
    main(){
        // Hide auth UI, then load client library.
        var issuesListView = new IssuesListView();
        $("#authorize-div").hide();
        issuesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        
        IssuesSetup.issuesRepository = new SimpleRepository(  'Issues repository',
                                                            'getIssuesListPerContract',
                                                            'addNewIssue',
                                                            'editIssue',
                                                            'deleteIssue');
        
        //IssuesSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
        //                                                        'getIssuesReactionsListPerProject',
        //                                                        'addNewIssueReaction',
        //                                                        'ediIssuetReaction',
        //                                                        'deleteIssueReaction');
        IssuesSetup.personsRepository = new SimpleRepository('Persons repository',
                                                    'getPersonsNameSurnameEmailList',
                                                );
        
        
        var promises = [];
        
        //promises[0] = IssuesSetup.reactionsRepository.initialise(IssuesSetup.reactionsRepository.parentItemId);
        promises[1] = IssuesSetup.issuesRepository.initialise(IssuesSetup.issuesRepository.parentItemId);
        promises[3] = personsRepository.initialise();

        Promise.all(promises)
            .then(()=>  {   console.log("Repositories initialised");
                            issuesListView.initialise();
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

