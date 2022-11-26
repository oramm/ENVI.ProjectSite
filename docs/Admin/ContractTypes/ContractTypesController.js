"use strict";
var ContractTypesController = /** @class */ (function () {
    function ContractTypesController() {
    }
    ContractTypesController.main = function () {
        // Hide auth UI, then load client library.
        var contractTypesListView = new ContractTypesListView();
        $("#authorize-div").hide();
        contractTypesListView.dataLoaded(false);
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
            ContractTypesSetup.milestoneTypesRepository.initialiseNodeJS('milestoneTypes'),
            ContractTypesSetup.milestoneTemplatesRepository.initialiseNodeJS('milestoneTemplates'),
            ContractTypesSetup.milestoneTypeContractTypeAssociationsRepository.initialiseNodeJS('milestoneTypeContractTypeAssociations'),
        ];
        Promise.all(promises)
            .then(function () {
            console.log("Repositories initialised");
            contractTypesListView.initialise();
        })
            .then(function () {
            $('select').material_select();
            $('.modal').modal();
            $('.datepicker').pickadate(MainSetup.datePickerSettings);
            ReachTextArea.reachTextAreaInit();
            Materialize.updateTextFields();
            $('ul.tabs').tabs();
            iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    return ContractTypesController;
}());
