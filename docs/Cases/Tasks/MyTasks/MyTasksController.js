"use strict";
var MyTasksController = /** @class */ (function () {
    function MyTasksController() {
    }
    MyTasksController.prototype.main = function () {
        // Hide auth UI, then load client library.
        var myTasksView = new MyTasksView();
        $("#authorize-div").hide();
        myTasksView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        tasksRepository = new SimpleRepository('MyTasks repository', 'getMyTasksList', 'addNewTask', 'editTask', 'deleteTask');
        var promises = [
            tasksRepository.initialise({ contractStatusCondition: 'Nie rozpoczęty|W trakcie' })
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            myTasksView.initialise();
        })
            .then(function () {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return MyTasksController;
}());
