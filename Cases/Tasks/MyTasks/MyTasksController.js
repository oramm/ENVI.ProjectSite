class MyTasksController {
    main() {
        // Hide auth UI, then load client library.
        var myTasksView = new MyTasksView();
        $("#authorize-div").hide();
        myTasksView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        tasksRepository = new SimpleRepository('Cases repository',
            'getTasksListPerMilestone',
            'addNewTask',
            'editTask',
            'deleteTask');


        var promises = [
            tasksRepository.initialise()
        ]

        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                myTasksView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
            }
            )
            .catch(err => {
                console.error(err);
            });

    }
}

