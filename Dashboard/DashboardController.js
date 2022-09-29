class DashboardController {
    main() {
        // Hide auth UI, then load client library.
        const dashboardView = new DashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);

        dashboardView.initialise();
        dashboardView.dataLoaded(true);
        iFrameResize({ log: false, heightCalculationMethod: 'max', checkOrigin: false });
    }
}

