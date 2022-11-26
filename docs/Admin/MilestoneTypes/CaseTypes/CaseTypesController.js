"use strict";
var CaseTypesController = /** @class */ (function () {
    function CaseTypesController() {
    }
    CaseTypesController.prototype.main = function () {
        // Hide auth UI, then load client library.
        var listView = new CaseTypesListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        CaseTypesSetup.caseTypesRepository = new SimpleRepository({
            name: 'CaseTypes repository',
            actionsNodeJSSetup: { addNewRoute: 'caseType', editRoute: 'caseType', deleteRoute: 'caseType' },
        });
        CaseTypesSetup.caseTemplatesRepository = new SimpleRepository({
            name: 'CaseTemplates repository',
            actionsNodeJSSetup: { addNewRoute: 'caseTemplate', editRoute: 'caseTemplate', deleteRoute: 'caseTemplate' },
        });
        var promises = [
            CaseTypesSetup.caseTypesRepository.initialiseNodeJS("caseTypes/?milestoneTypeId=" + CaseTypesSetup.caseTypesRepository.parentItemId),
            CaseTypesSetup.caseTemplatesRepository.initialiseNodeJS("caseTemplates/?milestoneTypeId=" + CaseTypesSetup.caseTemplatesRepository.parentItemId),
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
    return CaseTypesController;
}());
