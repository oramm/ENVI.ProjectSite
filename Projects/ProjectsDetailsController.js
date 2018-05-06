class ProjectDetailsController {
    main(){
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        projectsRepository = new ProjectsRepository();
        projectsRepository.initialise()
            .then(()=>  {   console.log("Projects initialised");
                            projectDetailsView.initialise();
                        })
            .catch(err => {
                  console.error(err);
                });
    }
}

