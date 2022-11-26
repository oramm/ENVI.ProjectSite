"use strict";
class MilestoneTypesController {
    static main() {
        // Hide auth UI, then load client library.
        var milestoneTypesListView = new MilestoneTypesListView();
        $("#authorize-div").hide();
        milestoneTypesListView.dataLoaded(false);
        //signoutButton.style.display = 'block';
        ContractTypesSetup.contractTypesRepository = new SimpleRepository({
            name: 'ContractTypes repository',
            actionsNodeJSSetup: { addNewRoute: 'contractType', editRoute: 'contractType', deleteRoute: 'contractType' },
        });
        ContractTypesSetup.milestoneTypesRepository = new SimpleRepository({
            name: 'MilestoneTypes repository',
            actionsNodeJSSetup: { addNewRoute: 'milestoneType', editRoute: 'milestoneType', deleteRoute: 'milestoneType' },
        });
        ContractTypesSetup.milestoneTemplatesRepository = new SimpleRepository({
            name: 'MilestoneTemplates repository',
            actionsNodeJSSetup: { addNewRoute: 'milestoneTemplate', editRoute: 'milestoneTemplate', deleteRoute: 'milestoneTemplate' },
        });
        ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository = new SimpleRepository({
            name: 'MilestoneTypeContractTypeAssociations repository',
            actionsNodeJSSetup: { addNewRoute: 'milestoneTypeContractTypeAssociation', editRoute: 'milestoneTypeContractTypeAssociation', deleteRoute: 'milestoneTypeContractTypeAssociation' },
        });
        var promises = [
            ContractTypesSetup.contractTypesRepository.initialiseNodeJS('contractTypes/?status=ACTIVE'),
            ContractTypesSetup.milestoneTypesRepository.initialiseNodeJS(`milestoneTypes`),
            ContractTypesSetup.milestoneTemplatesRepository.initialiseNodeJS('milestoneTemplates'),
            ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.initialiseNodeJS(`milestoneTypeContractTypeAssociations`),
        ];
        Promise.all(promises)
            .then(() => {
            console.log("Repositories initialised");
            milestoneTypesListView.initialise();
        })
            .then(() => {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
            $('ul.tabs').tabs();
            iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
        })
            .catch(err => {
            console.error(err);
        });
    }
}
