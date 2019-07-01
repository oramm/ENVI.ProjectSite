class DashboardController {
    main(){
        // Hide auth UI, then load client library.
        var dashboardView = new ContractDashboardView();
        $("#authorize-div").hide();
        dashboardView.dataLoaded(false);
        ContractsSetup.contractsRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Contracts repository')));
        
        new Promise(()=>dashboardView.initialise())
            .then(()=>{ dashboardView.dataLoaded(true);
                        //$('ul.tabs').tabs();

                      });
        
        iFrameResize({log:false, heightCalculationMethod:'max', checkOrigin:false});
    }
}

