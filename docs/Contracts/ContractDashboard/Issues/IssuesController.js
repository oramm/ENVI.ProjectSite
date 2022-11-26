"use strict";
var IssuesController = /** @class */ (function () {
    function IssuesController() {
    }
    IssuesController.main = function () {
        // Hide auth UI, then load client library.
        var issuesListView = new IssuesListView();
        $("#authorize-div").hide();
        issuesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        IssuesSetup.issuesRepository = new SimpleRepository('Issues repository', 'getIssuesListPerContract', 'addNewIssue', 'editIssue', 'deleteIssue');
        //IssuesSetup.reactionsRepository = new SimpleRepository(  'Reactions repository',
        //                                                        'getIssuesReactionsListPerProject',
        //                                                        'addNewIssueReaction',
        //                                                        'ediIssuetReaction',
        //                                                        'deleteIssueReaction');
        var promises = [
            IssuesSetup.issuesRepository.initialise(IssuesSetup.issuesRepository.parentItemId)
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            issuesListView.initialise();
        })
            .then(function () {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return IssuesController;
}());
