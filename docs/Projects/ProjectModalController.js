"use strict";
var ProjectModalController = /** @class */ (function () {
    function ProjectModalController(modal) {
        this.modal = modal;
        this._this = this;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    ProjectModalController.prototype.initAddNewDataHandler = function () {
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            projectId: this.modal.connectedResultsetComponent.connectedRepository.parentItemId
        };
    };
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    ProjectModalController.prototype.employersChipsRefreshDataSet = function () {
        this.modal.selectedEmployersHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEmployersHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEmployersHiddenInput.value = MainSetup.currentProject._employers;
            for (var i = 0; i < this.modal.selectedEmployersHiddenInput.value.length; i++) {
                this.appendEmployerChip(this.modal.selectedEmployersHiddenInput.value[i]);
            }
        }
    };
    ProjectModalController.prototype.employerSelectFieldInitialize = function () {
        this.modal.employerAutoCompleteTextField.clearChosenItem();
    };
    ProjectModalController.prototype.checkEmployer = function (employerItem) {
        //wyklucz pozycje wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEmployersHiddenInput.value.map(function (existingEmployerItem) {
            if (existingEmployerItem.id == employerItem.id)
                allowType = false;
        });
        return allowType; //employerTypeItem.milestoneTypeId==EmployersSetup.currentMilestone._type.id;
    };
    ProjectModalController.prototype.onEmployerChosen = function (chosenItem) {
        this.addEmployerItem(chosenItem);
        this.employerSelectFieldInitialize(chosenItem);
    };
    ProjectModalController.prototype.addEmployerItem = function (employerDataItem) {
        this.modal.selectedEmployersHiddenInput.value.push(employerDataItem);
        this.appendEmployerChip(employerDataItem);
    };
    ProjectModalController.prototype.appendEmployerChip = function (employerDataItem) {
        var chipLabel = employerDataItem.name;
        this.modal.selectedEmployersHiddenInput.$dom.parent()
            .prepend(new Chip('employer_', chipLabel, employerDataItem, this.onEmployerUnchosen, this).$dom);
    };
    ProjectModalController.prototype.onEmployerUnchosen = function (unchosenItem) {
        //LettersSetup.employersRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEmployerItem(unchosenItem);
    };
    //usuwa employerItem z listy HiddenInput.value[]
    ProjectModalController.prototype.removeEmployerItem = function (employerDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEmployersHiddenInput.value, 'id', employerDataItem.id);
        this.modal.selectedEmployersHiddenInput.value.splice(index, 1);
    };
    return ProjectModalController;
}());
;
