class LetterModalController {
    constructor(modal){
        this.modal = modal;
        //this._this = this;
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler(){
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [],
            _entitiesMain: [],
            _entitiesCc: [],
            _project: LettersSetup.currentProject,
            _editor:{name: LettersSetup.currentUser.name,
                     surname: LettersSetup.currentUser.surname,
                     systemEmail: LettersSetup.currentUser.systemEmail
                    },
            _lastUpdated: ''
            };
        LettersSetup.casesRepository.currentItems=[];
        this.modal.isOurSwitchInput.setValue(false);
    }
    /*
     * ustawia stan po otwarciu okna
     */
    initIsOurSwitchInput(){
        var isOur = (this.modal.mode==='EDIT')? LettersSetup.lettersRepository.currentItem.isOur : false;
        this.onLetterTypeChosen(isOur, this.modal);
        if(this.modal.mode==='EDIT')
            this.modal.isOurSwitchInput.$dom.parent().hide();
    }
                
    /*
     * ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
     */
    initCasesChips(){
        this.modal.selectedCasesHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode=='ADD_NEW')
            this.modal.selectedCasesHiddenInput.value = [];
        if (this.modal.mode=='EDIT') {
            this.modal.selectedCasesHiddenInput.value = LettersSetup.lettersRepository.currentItem._cases;
            for (var i=0; i<this.modal.selectedCasesHiddenInput.value.length; i++){
                this.appendCaseChip(this.modal.selectedCasesHiddenInput.value[i]);
            }
        }
    }
    /*
     * ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
     */
    initEntitiesMainChips(){
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode=='ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode=='EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i=0; i<this.modal.selectedEntitiesMainHiddenInput.value.length; i++){
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    }
    /*
     * ustawia stan po otwarciu okna
     */
    initNumberInput(){
        if(!this.modal.isOurSwitchInput.getValue() || 
           this.modal.isOurSwitchInput.getValue() && !LettersSetup.documentTemplatesRepository.currentItem.id
          ){
            this.modal.numberInputTextField.$dom.parent().show();
            this.modal.numberInputTextField.setIsRequired(true);
        } else {
            this.modal.numberInputTextField.$dom.parent().hide();
            this.modal.numberInputTextField.setValue('');
            this.modal.numberInputTextField.setIsRequired(false);
        }
      
    }
    
    initFileInput(){
        if(this.modal.mode==='ADD_NEW' && 
           (!this.modal.isOurSwitchInput.getValue() || !LettersSetup.documentTemplatesRepository.currentItem.id)){
            //this.modal.letterFileInput.value=[];
            this.modal.letterFileInput.isRequired = true;
        } else
            this.modal.letterFileInput.isRequired = false;
        
        this.modal.form.setElementDescription(this.setFileInputDescription(), this.modal.fileFormElement);
    }
    
    onLetterTypeChosen(isOur){
        var entityNameLabel = (isOur)? 'Dodaj odbiorcę' : 'Dodaj nadawcę';
        this.modal.entityMainAutoCompleteTextField.setLabel(entityNameLabel);
        var registrationDateLabel = (isOur)? 'Data nadania' : 'Data wpływu';
        this.modal.registrationDatePicker.setLabel(registrationDateLabel);
        
        this.initFileInput();
        this.initNumberInput();
        if(isOur){
            //this.modal.templateSelectField.simulateChosenItem(this.modal.templateSelectField.defaultDisabledOption);
            this.modal.templateSelectField.$dom.parent().show();
        } else {
            this.modal.templateSelectField.simulateChosenItem(this.modal.templateSelectField.defaultDisabledOption);
            this.modal.templateSelectField.$dom.parent().hide();
            LettersSetup.documentTemplatesRepository.currentItem = {};
        }
    }
    
    onTemplateChosen(chosenItem){
        if(chosenItem && chosenItem !== this.modal.templateSelectField.defaultDisabledOption){
            LettersSetup.documentTemplatesRepository.currentItem = chosenItem;
            this.modal.letterFileInput.isRequired = false;
        }
        else {
            LettersSetup.documentTemplatesRepository.currentItem = {};
            this.modal.letterFileInput.isRequired = true;
        }
        this.initNumberInput();
        this.initFileInput();
    }
    
    onContractChosen(chosenItem){
        LettersSetup.contractsRepository.currentItem = chosenItem;
        if(chosenItem)
            this.milestoneSelectFieldInitialize(chosenItem);
    }
    
    milestoneSelectFieldInitialize(){
        var currentMilestones = LettersSetup.milestonesRepository.items.filter(
                item=>  item._parent.id == LettersSetup.contractsRepository.currentItem.id
            );
        this.modal.milestoneSelectField.initialise(currentMilestones, '_FolderNumber_TypeName_Name',this.onMilestoneChosen, this);
    }
    
    onMilestoneChosen(chosenItem){
        LettersSetup.milestonesRepository.currentItem = chosenItem;
        if(chosenItem)
            this.caseSelectFieldInitialize(chosenItem);
    }
    
    caseSelectFieldInitialize(){
        var currentCases = LettersSetup.casesRepository.items.filter(
                item=>  item._parent.id == LettersSetup.milestonesRepository.currentItem.id &&
                        this.checkCase(item)
            );
        this.modal.caseSelectField.initialise(currentCases, '_typeFolderNumber_TypeName_Number_Name',this.onCaseChosen, this);
    }
    
    checkCase(caseItem){
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedCasesHiddenInput.value.map(existingCaseItem=>{
                if (existingCaseItem.id==caseItem.id)
                        allowType = false;
            });
        return allowType;//caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
    }
    onCaseChosen(chosenItem){
        this.addCaseItem(chosenItem);
        this.caseSelectFieldInitialize(chosenItem);
    }
    
    addCaseItem(caseDataItem){
        this.modal.selectedCasesHiddenInput.value.push(caseDataItem);
        this.appendCaseChip(caseDataItem);
    }

    appendCaseChip(caseDataItem){
        var chipLabel;
        if(caseDataItem._parent._parent.ourId)
            chipLabel = caseDataItem._parent._parent.ourId;
        else chipLabel = caseDataItem._parent._parent.number;
        chipLabel += ', ' + caseDataItem._parent._type._folderNumber + ' ' + 
                     caseDataItem._parent._type.name + 
                     ' | '
        chipLabel += caseDataItem._typeFolderNumber_TypeName_Number_Name
        this.modal.selectedCasesHiddenInput.$dom.parent()
                .prepend(new Chip(  'case_', 
                                    chipLabel,
                                    caseDataItem,
                                    this.onCaseUnchosen,
                                    this).$dom);

    }
    onCaseUnchosen(unchosenItem){
        //LettersSetup.casesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeCaseItem(unchosenItem);
    }
                
    //usuwa caseItem z listy HiddenInput.value[]
    removeCaseItem(caseDataItem){
        var index = Tools.arrGetIndexOf(this.modal.selectedCasesHiddenInput.value, 'id', caseDataItem.id); 
        this.modal.selectedCasesHiddenInput.value.splice(index, 1);
    }
    
    
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    entitiesChipsMainRefreshDataSet(){
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent().children('.chip').remove();
        if (this.modal.mode=='ADD_NEW')
            this.modal.selectedEntitiesMainHiddenInput.value = [];
        if (this.modal.mode=='EDIT') {
            this.modal.selectedEntitiesMainHiddenInput.value = LettersSetup.lettersRepository.currentItem._entitiesMain;
            for (var i=0; i<this.modal.selectedEntitiesMainHiddenInput.value.length; i++){
                this.appendEntityMainChip(this.modal.selectedEntitiesMainHiddenInput.value[i]);
            }
        }
    }
    
    entitySelectFieldInitialize(){
        this.modal.entityMainAutoCompleteTextField.clearChosenItem();
    }
    
    checkEntity(entityItem){
        //wyklucz sprawy wybrane już wcześniej
        var allowType = true;
        this.modal.selectedEntitiesMainHiddenInput.value.map(existingEntityItem=>{
                if (existingEntityItem.id==entityItem.id)
                        allowType = false;
            });
        return allowType;//entityTypeItem.milestoneTypeId==EntitiesSetup.currentMilestone._type.id;
    }
    onEntityMainChosen(chosenItem){
        this.addEntityMainItem(chosenItem);
        this.entitySelectFieldInitialize(chosenItem);
    }
    
    addEntityMainItem(entityDataItem){
        this.modal.selectedEntitiesMainHiddenInput.value.push(entityDataItem);
        this.appendEntityMainChip(entityDataItem);
    }

    appendEntityMainChip(entityDataItem){
        var chipLabel = entityDataItem.name;
        this.modal.selectedEntitiesMainHiddenInput.$dom.parent()
                .prepend(new Chip(  'entity_', 
                                    chipLabel,
                                    entityDataItem,
                                    this.onEntityUnchosen,
                                    this).$dom);

    }
    onEntityUnchosen(unchosenItem){
        //LettersSetup.entitiesRepository.deleteFromCurrentItems(unchosenItem);
        this.removeEntityItem(unchosenItem);
    }
                
    //usuwa entityItem z listy HiddenInput.value[]
    removeEntityItem(entityDataItem){
        var index = Tools.arrGetIndexOf(this.modal.selectedEntitiesMainHiddenInput.value, 'id', entityDataItem.id); 
        this.modal.selectedEntitiesMainHiddenInput.value.splice(index, 1);
    }
    
    
    setFileInputDescription(){
        var description ='';
        if(this.modal.templateSelectField.getValue() && this.modal.templateSelectField.getValue() !== this.modal.templateSelectField.defaultDisabledOption)
            description = 'Dodaj załączniki. ';
        else
            description = 'Wybierz plik pisma i ew. załączniki. ';
        if(this.modal.mode=='ADD_NEW')
            description += 'Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]';
        else if(this.modal.mode=='EDIT' && LettersSetup.lettersRepository.currentItem._canUserChangeFileOrFolder){
            this.modal.letterFileInput.$dom.show();
            description += 'Jeżeli edytujesz pismo i nie chcesz zmieniać załącznika, zignoruj to pole';
        } else {
            this.modal.letterFileInput.$dom.hide();
            description = 'Nie masz uprawnień do zmiany plików tego pisma. Może to zrobić tylko: ' + LettersSetup.lettersRepository.currentItem._fileOrFolderOwnerEmail;
        }
        return description;
    }
};