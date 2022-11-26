"use strict";
var GantController = /** @class */ (function () {
    function GantController() {
    }
    GantController.prototype.main = function () {
        // Hide auth UI, then load client library.
        var gantView = new GantView();
        $("#authorize-div").hide();
        gantView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        milestonesRepository = new SimpleRepository('Milestones repository', 'getMilestonesList', 'addNewMilestone', 'editMilestone', 'deleteMilestone');
        contractsRepository = new SimpleRepository('Contracts repository', 'getContractsList', 'addNewContract', 'editContract', 'deleteContract');
        var promises = [];
        promises[0] = milestonesRepository.initialise({ projectId: milestonesRepository.parentItemId });
        promises[1] = contractsRepository.initialise({ projectId: contractsRepository.parentItemId });
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            gantView.initialise();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return GantController;
}());
