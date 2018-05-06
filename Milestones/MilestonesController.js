class MilestonesController {
    main(){
        // Hide auth UI, then load client library.
        var viewObject = new MilestonesListView();
        $("#authorize-div").hide();
        viewObject.dataLoaded(false);
        //signoutButton.style.display = 'block';
        milestonesRepository = new MilestonesRepository();
        milestonesRepository.initialise()
            .then(()=>  {   console.log("Milestones initialised");
                            viewObject.initialise();
                        })
            .catch(err => {
                  console.error(err);
                });
    }
}

