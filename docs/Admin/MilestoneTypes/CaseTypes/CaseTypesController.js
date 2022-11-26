"use strict";
class CaseTypesController {
    main() {
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
        const promises = [
            CaseTypesSetup.caseTypesRepository.initialiseNodeJS(`caseTypes/?milestoneTypeId=${CaseTypesSetup.caseTypesRepository.parentItemId}`),
            CaseTypesSetup.caseTemplatesRepository.initialiseNodeJS(`caseTemplates/?milestoneTypeId=${CaseTypesSetup.caseTemplatesRepository.parentItemId}`),
        ];
        Promise.all(promises)
            .then(() => {
            console.log("Repositories initialised");
            listView.initialise();
        })
            .then(() => {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
        })
            .catch(err => {
            console.error(err);
            alert('Wystąpił bład. Zgłoś go administratorowi systemu: \n' +
                err);
        });
    }
}
