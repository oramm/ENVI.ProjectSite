"use strict";
var ContractModalController = /** @class */ (function () {
    function ContractModalController(modal) {
        this.modal = modal;
        //this._this = this;
    }
    /** Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId */
    ContractModalController.prototype.initAddNewDataHandler = function () {
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            _parent: MainSetup.currentProject,
            projectId: this.modal.connectedResultsetComponent.connectedRepository.parentItemId
        };
        if (MainSetup.currentProject._employers[0])
            this.onEmployerChosen(MainSetup.currentProject._employers[0]);
    };
    ContractModalController.prototype.initEditDataHandler = function () {
        this.modal.connectedResultsetComponent.connectedRepository.currentItem._parent = MainSetup.currentProject;
        this.modal.connectedResultsetComponent.connectedRepository.currentItem.projectId = this.modal.connectedResultsetComponent.connectedRepository.parentItemId;
    };
    //--------------------------------- Contractors HiddenInput ------------------------------------
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    ContractModalController.prototype.contractorsChipsRefreshDataSet = function () {
        this.modal.selectedContractorsHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedContractorsHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedContractorsHiddenInput.value = ContractsSetup.contractsRepository.currentItem._contractors;
            for (var i = 0; i < this.modal.selectedContractorsHiddenInput.value.length; i++) {
                this.appendContractorChip(this.modal.selectedContractorsHiddenInput.value[i]);
            }
        }
    };
    ContractModalController.prototype.contractorSelectFieldInitialize = function () {
        this.modal.contractorAutoCompleteTextField.clearChosenItem();
    };
    ContractModalController.prototype.checkContractor = function (contractorItem) {
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedContractorsHiddenInput.value.map(function (existingContractorItem) {
            if (existingContractorItem.id == contractorItem.id)
                allowType = false;
        });
        return allowType; //contractorTypeItem.milestoneTypeId==ContractorsSetup.currentMilestone._type.id;
    };
    ContractModalController.prototype.onContractorChosen = function (chosenItem) {
        this.addContractorItem(chosenItem);
        this.contractorSelectFieldInitialize(chosenItem);
    };
    ContractModalController.prototype.addContractorItem = function (contractorDataItem) {
        this.modal.selectedContractorsHiddenInput.value.push(contractorDataItem);
        this.appendContractorChip(contractorDataItem);
    };
    ContractModalController.prototype.appendContractorChip = function (contractorDataItem) {
        var chipLabel = contractorDataItem.name;
        this.modal.selectedContractorsHiddenInput.$dom.parent()
            .prepend(new Chip('contractor_', chipLabel, contractorDataItem, this.onContractorUnchosen, this).$dom);
    };
    ContractModalController.prototype.onContractorUnchosen = function (unchosenItem) {
        this.removeContractorItem(unchosenItem);
    };
    //usuwa contractorItem z listy HiddenInput.value[]
    ContractModalController.prototype.removeContractorItem = function (contractorDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedContractorsHiddenInput.value, 'id', contractorDataItem.id);
        this.modal.selectedContractorsHiddenInput.value.splice(index, 1);
    };
    //--------------------------------- Employers HiddenInput ------------------------------------
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    ContractModalController.prototype.employersChipsRefreshDataSet = function () {
        this.modal.selectedEmployersHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEmployersHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEmployersHiddenInput.value = ContractsSetup.contractsRepository.currentItem._employers;
            for (var i = 0; i < this.modal.selectedEmployersHiddenInput.value.length; i++) {
                this.appendEmployerChip(this.modal.selectedEmployersHiddenInput.value[i]);
            }
        }
    };
    ContractModalController.prototype.employerSelectFieldInitialize = function () {
        this.modal.employerAutoCompleteTextField.clearChosenItem();
    };
    ContractModalController.prototype.checkEmployer = function (employerItem) {
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEmployersHiddenInput.value.map(function (existingEmployerItem) {
            if (existingEmployerItem.id == employerItem.id)
                allowType = false;
        });
        return allowType; //employerTypeItem.milestoneTypeId==EmployersSetup.currentMilestone._type.id;
    };
    ContractModalController.prototype.onEmployerChosen = function (chosenItem) {
        this.addEmployerItem(chosenItem);
        this.employerSelectFieldInitialize(chosenItem);
    };
    ContractModalController.prototype.addEmployerItem = function (employerDataItem) {
        this.modal.selectedEmployersHiddenInput.value.push(employerDataItem);
        this.appendEmployerChip(employerDataItem);
    };
    ContractModalController.prototype.appendEmployerChip = function (employerDataItem) {
        var chipLabel = employerDataItem.name;
        this.modal.selectedEmployersHiddenInput.$dom.parent()
            .prepend(new Chip('employer_', chipLabel, employerDataItem, this.onEmployerUnchosen, this).$dom);
    };
    ContractModalController.prototype.onEmployerUnchosen = function (unchosenItem) {
        this.removeEmployerItem(unchosenItem);
    };
    //usuwa employerItem z listy HiddenInput.value[]
    ContractModalController.prototype.removeEmployerItem = function (employerDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEmployersHiddenInput.value, 'id', employerDataItem.id);
        this.modal.selectedEmployersHiddenInput.value.splice(index, 1);
    };
    return ContractModalController;
}());
;
