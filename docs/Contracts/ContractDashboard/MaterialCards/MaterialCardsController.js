"use strict";
var MaterialCardsController = /** @class */ (function () {
    function MaterialCardsController() {
    }
    MaterialCardsController.prototype.main = function () {
        // Hide auth UI, then load client library.
        var materialCardsListView = new MaterialCardsListView();
        $("#authorize-div").hide();
        materialCardsListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        MaterialCardsSetup.materialCardsRepository = new SimpleRepository('MaterialCards repository', 'getMaterialCardsListPerContract', 'addNewMaterialCard', 'editMaterialCard', 'deleteMaterialCard');
        MaterialCardsSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        MaterialCardsSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));
        var promises = [
            MaterialCardsSetup.materialCardsRepository.initialiseNodeJS('materialCards/?contractId=' + MaterialCardsSetup.materialCardsRepository.parentItemId)
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            materialCardsListView.initialise();
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
    return MaterialCardsController;
}());
