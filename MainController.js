class MainController {
    main(){
        // Hide auth UI, then load client library.
        mainWindowView = new MainWindowView();
        $("#authorize-div").hide();
        mainWindowView.dataLoaded(false);
        

        //signoutButton.style.display = 'block';
        //projectsRepository = new ProjectsRepository();
        projectsRepository = new SimpleRepository('Projects repository',
                                                 'getProjectsList',
                                                 //'addNewProjectInDb',
                                                 //'editProjectInDb',
                                                 //'deleteProject'
                                                         );
        projectsRepository.initialise()
            .then(()=>  {   console.log("Projects initialised");
                            mainWindowView.initialise();
                            mainWindowView.dataLoaded(true);
                        })
            .catch(err => {
                  console.error(err);
                });
    }
}

