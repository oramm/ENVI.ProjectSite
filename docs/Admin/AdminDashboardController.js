"use strict";
var AdminDashboardController = /** @class */ (function () {
    function AdminDashboardController() {
    }
    AdminDashboardController.main = function () {
        // Hide auth UI, then load client library.
        var dashboardView = new AdminDashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        //ContractsTypesSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        new Promise(function () { return dashboardView.initialise(); })
            .then(function () {
            dashboardView.dataLoaded(true);
            $('ul.tabs').tabs();
        });
        iFrameResize({ log: false, heightCalculationMethod: 'max', checkOrigin: false });
    };
    return AdminDashboardController;
}());
