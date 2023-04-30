class IssuesController {
    static main() {
        // Hide auth UI, then load client library.
        var issuesListView = new IssuesListView();
        $("#authorize-div").hide();
        issuesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        IssuesSetup.issuesRepository = new SimpleRepository('Issues repository',
            'getIssuesListPerContract',
            'addNewIssue',
            'editIssue',
            'deleteIssue');

        //IssuesSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
        //                                                        'getIssuesReactionsListPerProject',
        //                                                        'addNewIssueReaction',
        //                                                        'ediIssuetReaction',
        //                                                        'deleteIssueReaction');

        var promises = [
            IssuesSetup.issuesRepository.initialise(IssuesSetup.issuesRepository.parentItemId)
        ];


        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                issuesListView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
            }
            )
            .catch(err => {
                console.error(err);
            });

    }
}

