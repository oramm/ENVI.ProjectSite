"use strict";
class ProjectModalController {
    constructor(modal) {
        this.modal = modal;
        this._this = this;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            projectId: this.modal.connectedResultsetComponent.connectedRepository.parentItemId
        };
    }
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    employersChipsRefreshDataSet() {
        this.modal.selectedEmployersHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEmployersHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEmployersHiddenInput.value = MainSetup.currentProject._employers;
            for (var i = 0; i < this.modal.selectedEmployersHiddenInput.value.length; i++) {
                this.appendEmployerChip(this.modal.selectedEmployersHiddenInput.value[i]);
            }
        }
    }
    employerSelectFieldInitialize() {
        this.modal.employerAutoCompleteTextField.clearChosenItem();
    }
    checkEmployer(employerItem) {
        //wyklucz pozycje wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEmployersHiddenInput.value.map(existingEmployerItem => {
            if (existingEmployerItem.id == employerItem.id)
                allowType = false;
        });
        return allowType; //employerTypeItem.milestoneTypeId==EmployersSetup.currentMilestone._type.id;
    }
    onEmployerChosen(chosenItem) {
        this.addEmployerItem(chosenItem);
        this.employerSelectFieldInitialize(chosenItem);
    }
    addEmployerItem(employerDataItem) {
        this.modal.selectedEmployersHiddenInput.value.push(employerDataItem);
        this.appendEmployerChip(employerDataItem);
    }
    appendEmployerChip(employerDataItem) {
        const chipLabel = employerDataItem.name;
        this.modal.selectedEmployersHiddenInput.$dom.parent()
            .prepend(new Chip('employer_', chipLabel, employerDataItem, this.onEmployerUnchosen, this).$dom);
    }
    onEmployerUnchosen(unchosenItem) {
        //LettersSetup.employersRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEmployerItem(unchosenItem);
    }
    //usuwa employerItem z listy HiddenInput.value[]
    removeEmployerItem(employerDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEmployersHiddenInput.value, 'id', employerDataItem.id);
        this.modal.selectedEmployersHiddenInput.value.splice(index, 1);
    }
}
;
