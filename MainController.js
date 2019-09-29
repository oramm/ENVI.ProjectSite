class MainController {
    main(){
        // Hide auth UI, then load client library.
        mainWindowView = new MainWindowView();
        mainWindowView.loadIframe("iframeMain", 'Dashboard/dashboard.html');
        $("#authorize-div").hide();
        mainWindowView.dataLoaded(false);
        

        //signoutButton.style.display = 'block';
        //projectsRepository = new ProjectsRepository();
        projectsRepository = new SimpleRepository('Projects repository',
                                                 'getProjectsList',
                                                 'addNewProject',
                                                 'editProject'
                                                 );
        
        projectsRepository.initialise(gAuth.userEmail)
            .then(()=>  {   sessionStorage.setItem('Current User', JSON.stringify({name: gAuth.userName,
                                                                                   surname: '',
                                                                                   systemEmail: gAuth.userEmail,
                                                                                   googleImage: gAuth.userGoogleImage
                                                                                   })
                                                   );

                            console.log("Projects initialised");
                            mainWindowView.initialise();
                            mainWindowView.dataLoaded(true);
                            iFrameResize({log:false, heightCalculationMethod: 'taggedElement',  checkOrigin:false});
                        })
            .catch(err => {
                  console.error(err);
                });
    }
}

