"use strict";
class RisksController {
    static main() {
        // Hide auth UI, then load client library.
        var risksListView = new RisksListView();
        $("#authorize-div").hide();
        risksListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        RisksSetup.risksRepository = new SimpleRepository('Risks repository', 'getRisksListPerProject', 'addNewRisk', 'editRisk', 'deleteRisk');
        RisksSetup.reactionsRepository = new SimpleRepository('Reactions repository', 'getRisksReactionsListPerContract', 'addNewTask', 'editTask', 'deleteTask');
        RisksSetup.casesRepository = new SimpleRepository('Cases repository', 'getCasesListPerContract', 'addNewCase', 'editCase', 'deleteCase');
        RisksSetup.personsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Persons repository')));
        RisksSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        RisksSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));
        const promises = [
            RisksSetup.reactionsRepository.initialiseNodeJS('risks/?contractId=' + RisksSetup.milestonesRepository.parentItemId),
            RisksSetup.risksRepository.initialiseNodeJS('risks/?contractId=' + RisksSetup.milestonesRepository.parentItemId),
            RisksSetup.casesRepository.initialiseNodeJS('cases/?contractId=' + RisksSetup.casesRepository.parentItemId)
        ];
        Promise.all(promises)
            .then(() => {
            console.log("Repositories initialised");
            risksListView.initialise();
        })
            .then(() => {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
        })
            .catch(err => {
            console.error(err);
        });
    }
}
