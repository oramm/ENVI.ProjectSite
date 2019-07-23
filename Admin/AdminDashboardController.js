class AdminDashboardController {
    main(){
        // Hide auth UI, then load client library.
        var dashboardView = new AdminDashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        //ContractsTypesSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        
        new Promise(()=>dashboardView.initialise())
            .then(()=>{ dashboardView.dataLoaded(true);
                        $('ul.tabs').tabs();

                      });
        
        iFrameResize({log:false, heightCalculationMethod:'max', checkOrigin:false});
    }
}

