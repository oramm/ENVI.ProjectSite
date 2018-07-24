class DashboardController {
    main(){
        // Hide auth UI, then load client library.
        var dashboardView = new DashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        
        dashboardView.initialise();
        dashboardView.dataLoaded(true);
    }
}

