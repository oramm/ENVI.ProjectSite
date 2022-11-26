"use strict";
var LetterModalController = /** @class */ (function () {
    function LetterModalController(modal) {
        this.modal = modal;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    LetterModalController.prototype.initAddNewDataHandler = function () {
        LettersSetup.lettersRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [],
            _entitiesMain: [],
            _entitiesCc: [],
            _project: MainSetup.currentProject,
            _editor: {
                name: MainSetup.currentUser.name,
                surname: MainSetup.currentUser.surname,
                systemEmail: MainSetup.currentUser.systemEmail
            },
            _lastUpdated: ''
        };
        LettersSetup.casesRepository.currentItems = [];
        //this.caseSelectFieldInitialize();
        this.modal.entityMainAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', this.onEntityMainChosen, this);
        this.modal.creationDateFormElement.input.setValue(new Date());
        this.modal.registrationDateFormElement.input.setValue(new Date());
    };
    /*
     * ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
     */
    LetterModalController.prototype.initEntitiesMainChips = function () {
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i = 0; i < this.modal.selectedEntitiesMainHiddenInput.value.length; i++) {
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    };
    LetterModalController.prototype.onContractChosen = function (chosenItem) {
        LettersSetup.contractsRepository.currentItem = chosenItem;
        if (chosenItem) {
            this.caseSelectFieldInitialize();
            this.modal.caseCollapsibleMultiSelect.showCollapsibleButton.setEnabled(true);
        }
        else
            this.modal.caseCollapsibleMultiSelect.showCollapsibleButton.setEnabled(false);
    };
    /*
     * wywoływane przy wyborze kontraktu i przy edycji
     */
    LetterModalController.prototype.caseSelectFieldInitialize = function () {
        var _this = this;
        this.modal.caseCollapsibleMultiSelect.initialise(LettersSetup.contractsRepository.currentItem, '_parent', LettersSetup.milestonesRepository, function (dataItem) { return dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name; }, LettersSetup.casesRepository, function (dataItem) {
            var title = (dataItem._type.folderNumber) ? dataItem._type.folderNumber : ' ' + ' ';
            title += (dataItem._type.name) ? dataItem._type.name : '[Nie przypisano typu]' + ' | ';
            title += (dataItem._displayNumber) ? ' ' + dataItem._displayNumber + ' ' : '' + ' ';
            title += (dataItem.name) ? dataItem.name : ' ';
            return title;
        }, function () { return _this.onCaseChosen(); }, function () { return _this.onCaseUnchosen(); });
    };
    LetterModalController.prototype.onCaseChosen = function (chosenItem) {
        if (chosenItem) {
            this.caseSelectFieldInitialize();
        }
    };
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    LetterModalController.prototype.entitiesChipsMainRefreshDataSet = function () {
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i = 0; i < this.modal.selectedEntitiesMainHiddenInput.value.length; i++) {
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    };
    LetterModalController.prototype.entitySelectFieldInitialize = function () {
        this.modal.entityMainAutoCompleteTextField.clearChosenItem();
    };
    LetterModalController.prototype.checkEntity = function (entityItem) {
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEntitiesMainHiddenInput.value.map(function (existingEntityItem) {
            if (existingEntityItem.id == entityItem.id)
                allowType = false;
        });
        return allowType; //entityTypeItem.milestoneTypeId==EntitiesSetup.currentMilestone._type.id;
    };
    LetterModalController.prototype.onEntityMainChosen = function (chosenItem) {
        this.modal.entityMainAutoCompleteTextField.clearInput();
        this.addEntityMainItem(chosenItem);
    };
    LetterModalController.prototype.addEntityMainItem = function (entityDataItem) {
        this.modal.selectedEntitiesMainHiddenInput.value.push(entityDataItem);
        this.appendEntityMainChip(entityDataItem);
    };
    LetterModalController.prototype.appendEntityMainChip = function (entityDataItem) {
        var chipLabel = entityDataItem.name;
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent()
            .prepend(new Chip('entity_', chipLabel, entityDataItem, this.onEntityUnchosen, this).$dom);
    };
    LetterModalController.prototype.onEntityUnchosen = function (unchosenItem) {
        //MainSetup.entitiesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEntityItem(unchosenItem);
    };
    //usuwa entityItem z listy HiddenInput.value[]
    LetterModalController.prototype.removeEntityItem = function (entityDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEntitiesMainHiddenInput.value, 'id', entityDataItem.id);
        this.modal.selectedEntitiesMainHiddenInput.value.splice(index, 1);
        this.modal.entityMainAutoCompleteTextField.repository.deleteFromCurrentItems(entityDataItem);
    };
    return LetterModalController;
}());
;
