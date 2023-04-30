class LetterModalController {
    constructor(modal) {
        this.modal = modal;
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
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
    }

    /*
     * ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
     */
    initEntitiesMainChips() {
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i = 0; i < this.modal.selectedEntitiesMainHiddenInput.value.length; i++) {
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    }

    onContractChosen(chosenItem) {
        LettersSetup.contractsRepository.currentItem = chosenItem;
        if (chosenItem) {
            this.caseSelectFieldInitialize();
            this.modal.caseCollapsibleMultiSelect.showCollapsibleButton.setEnabled(true);
        } else
            this.modal.caseCollapsibleMultiSelect.showCollapsibleButton.setEnabled(false);
    }
    /* 
     * wywoływane przy wyborze kontraktu i przy edycji
     */
    caseSelectFieldInitialize() {
        this.modal.caseCollapsibleMultiSelect.initialise(
            LettersSetup.contractsRepository.currentItem,
            '_parent',
            LettersSetup.milestonesRepository,
            (dataItem) => dataItem._type._folderNumber + ' ' + dataItem._type.name + ' | ' + dataItem.name,
            LettersSetup.casesRepository,
            (dataItem) => {
                let title = (dataItem._type.folderNumber) ? dataItem._type.folderNumber : ' ' + ' ';
                title += (dataItem._type.name) ? dataItem._type.name : '[Nie przypisano typu]' + ' | ';
                title += (dataItem._displayNumber) ? ' ' + dataItem._displayNumber + ' ' : '' + ' ';
                title += (dataItem.name) ? dataItem.name : ' ';
                return title;
            },
            (item) => this.onCaseChosen(item),
            () => this.onCaseUnchosen()
        );
    }

    onCaseChosen(chosenItem) {
        if (chosenItem) {
            this.caseSelectFieldInitialize();
        }
    }

    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    entitiesChipsMainRefreshDataSet() {
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i = 0; i < this.modal.selectedEntitiesMainHiddenInput.value.length; i++) {
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    }

    entitySelectFieldInitialize() {
        this.modal.entityMainAutoCompleteTextField.clearChosenItem();
    }

    checkEntity(entityItem) {
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEntitiesMainHiddenInput.value.map(existingEntityItem => {
            if (existingEntityItem.id == entityItem.id)
                allowType = false;
        });
        return allowType;//entityTypeItem.milestoneTypeId==EntitiesSetup.currentMilestone._type.id;
    }
    onEntityMainChosen(chosenItem) {
        this.modal.entityMainAutoCompleteTextField.clearInput();
        this.addEntityMainItem(chosenItem);
    }

    addEntityMainItem(entityDataItem) {
        this.modal.selectedEntitiesMainHiddenInput.value.push(entityDataItem);
        this.appendEntityMainChip(entityDataItem);
    }

    appendEntityMainChip(entityDataItem) {
        var chipLabel = entityDataItem.name;
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent()
            .prepend(new Chip('entity_',
                chipLabel,
                entityDataItem,
                this.onEntityUnchosen,
                this).$dom);

    }
    onEntityUnchosen(unchosenItem) {
        //MainSetup.entitiesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEntityItem(unchosenItem);
    }

    //usuwa entityItem z listy HiddenInput.value[]
    removeEntityItem(entityDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEntitiesMainHiddenInput.value, 'id', entityDataItem.id);
        this.modal.selectedEntitiesMainHiddenInput.value.splice(index, 1);
        this.modal.entityMainAutoCompleteTextField.repository.deleteFromCurrentItems(entityDataItem);
    }
};