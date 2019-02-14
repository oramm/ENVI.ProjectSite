class DashboardController {
    main(){
        // Hide auth UI, then load client library.
        var dashboardView = new ContractDashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        
        new Promise(()=>dashboardView.initialise())
            .then(()=>{ dashboardView.dataLoaded(true);
                        //$('ul.tabs').tabs();

                      });
        
        iFrameResize({log:false, heightCalculationMethod:'max', checkOrigin:false});
    }
}

