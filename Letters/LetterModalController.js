class LetterModalController {
    constructor(modal) {
        this.modal = modal;
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [],
            _entitiesMain: [],
            _entitiesCc: [],
            _project: LettersSetup.currentProject,
            _editor: {
                name: LettersSetup.currentUser.name,
                surname: LettersSetup.currentUser.surname,
                systemEmail: LettersSetup.currentUser.systemEmail
            },
            _lastUpdated: ''
        };
        LettersSetup.casesRepository.currentItems = [];
    }


    /*
     * ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
     */
    initCasesChips() {
        this.modal.selectedCasesHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode == 'ADD_NEW')
            this.modal.selectedCasesHiddenInput.value = [];
        if (this.modal.mode == 'EDIT') {
            this.modal.selectedCasesHiddenInput.value = LettersSetup.lettersRepository.currentItem._cases;
            for (var i = 0; i < this.modal.selectedCasesHiddenInput.value.length; i++) {
                this.appendCaseChip(this.modal.selectedCasesHiddenInput.value[i]);
            }
        }
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
        if (chosenItem)
            this.milestoneSelectFieldInitialize(chosenItem);
    }

    milestoneSelectFieldInitialize() {
        var currentMilestones = LettersSetup.milestonesRepository.items.filter(
            item => item._parent.id == LettersSetup.contractsRepository.currentItem.id
        );
        this.modal.milestoneSelectField.initialise(currentMilestones, '_FolderNumber_TypeName_Name', this.onMilestoneChosen, this);
    }

    onMilestoneChosen(chosenItem) {
        LettersSetup.milestonesRepository.currentItem = chosenItem;
        if (chosenItem)
            this.caseSelectFieldInitialize(chosenItem);
    }

    caseSelectFieldInitialize() {
        var currentCases = LettersSetup.casesRepository.items.filter(
            item => item._parent.id == LettersSetup.milestonesRepository.currentItem.id &&
                this.checkCase(item)
        );
        this.modal.caseSelectField.initialise(currentCases, '_typeFolderNumber_TypeName_Number_Name', this.onCaseChosen, this);
    }

    checkCase(caseItem) {
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedCasesHiddenInput.value.map(existingCaseItem => {
            if (existingCaseItem.id == caseItem.id)
                allowType = false;
        });
        return allowType;//caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
    }
    onCaseChosen(chosenItem) {
        this.addCaseItem(chosenItem);
        this.caseSelectFieldInitialize(chosenItem);
    }

    addCaseItem(caseDataItem) {
        this.modal.selectedCasesHiddenInput.value.push(caseDataItem);
        this.appendCaseChip(caseDataItem);
    }

    appendCaseChip(caseDataItem) {
        var chipLabel;
        if (caseDataItem._parent._parent.ourId)
            chipLabel = caseDataItem._parent._parent.ourId;
        else chipLabel = caseDataItem._parent._parent.number;
        chipLabel += ', ' + caseDataItem._parent._type._folderNumber + ' ' +
            caseDataItem._parent._type.name +
            ' | '
        chipLabel += caseDataItem._typeFolderNumber_TypeName_Number_Name
        this.modal.selectedCasesHiddenInput.$dom.parent()
            .prepend(new Chip('case_',
                chipLabel,
                caseDataItem,
                this.onCaseUnchosen,
                this).$dom);

    }
    onCaseUnchosen(unchosenItem) {
        //LettersSetup.casesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeCaseItem(unchosenItem);
    }

    //usuwa caseItem z listy HiddenInput.value[]
    removeCaseItem(caseDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedCasesHiddenInput.value, 'id', caseDataItem.id);
        this.modal.selectedCasesHiddenInput.value.splice(index, 1);
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
        this.addEntityMainItem(chosenItem);
        this.entitySelectFieldInitialize(chosenItem);
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
        //LettersSetup.entitiesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEntityItem(unchosenItem);
    }

    //usuwa entityItem z listy HiddenInput.value[]
    removeEntityItem(entityDataItem) {
        var index = Tools.arrGetIndexOf(this.modal.selectedEntitiesMainHiddenInput.value, 'id', entityDataItem.id);
        this.modal.selectedEntitiesMainHiddenInput.value.splice(index, 1);
    }
};