"use strict";
var TaskTemplatesController = /** @class */ (function () {
    function TaskTemplatesController() {
    }
    TaskTemplatesController.prototype.main = function () {
        // Hide auth UI, then load client library.
        var listView = new TaskTemplatesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        TaskTemplatesSetup.taskTemplatesRepository = new SimpleRepository({
            name: 'TaskTemplates repository',
            actionsNodeJSSetup: { addNewRoute: 'taskTemplate', editRoute: 'taskTemplate', deleteRoute: 'taskTemplate' },
        });
        var promises = [
            TaskTemplatesSetup.taskTemplatesRepository.initialiseNodeJS("taskTemplates/?caseTemplateId=" + TaskTemplatesSetup.currentCaseTemplate.id)
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            listView.initialise();
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
            alert('Wystąpił bład. Zgłoś go administratorowi systemu: \n' +
                err);
        });
    };
    return TaskTemplatesController;
}());
