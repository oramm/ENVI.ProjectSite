class ProjectDetailsController {
    main(){
        // Hide auth UI, then load client library.
        var projectDetailsView = new ProjectDetailsView();
        $("#authorize-div").hide();
        projectDetailsView.dataLoaded(false);
        //signoutButton.style.display = 'block';
                                           
        projectDetailsView.initialise();
        
    }
}

