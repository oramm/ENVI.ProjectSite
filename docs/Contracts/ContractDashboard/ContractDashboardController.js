"use strict";
var DashboardController = /** @class */ (function () {
    function DashboardController() {
    }
    DashboardController.main = function () {
        // Hide auth UI, then load client library.
        var dashboardView = new ContractDashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        ContractsSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        new Promise(function () { return dashboardView.initialise(); })
            .then(function () {
            dashboardView.dataLoaded(true);
            //$('ul.tabs').tabs();
        });
        iFrameResize({ log: false, heightCalculationMethod: 'max', checkOrigin: false });
    };
    return DashboardController;
}());
