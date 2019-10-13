class LetterModalController {
    constructor(modal){
        this.modal = modal;
        this._this = this;
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler(){
        this.modal.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [],
            _project: LettersSetup.currentProject,
            _editor:{name: LettersSetup.currentUser.name,
                     surname: LettersSetup.currentUser.surname,
                     systemEmail: LettersSetup.currentUser.systemEmail
                    },
            _lastUpdated: ''
            };
        LettersSetup.casesRepository.currentItems=[];
    }
    
    //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
    casesChipsRefreshDataSet(){
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
    
    numberRefreshDataSet(){
        var description;
        var isOur;
        if(this.modal.mode === 'ADD_NEW')
            isOur = false;
        else
            isOur = LettersSetup.lettersRepository.currentItem.isOur;
        if(!isOur){
            this.modal.numberInputTextField.$dom.show();
            //description = 'Podaj numer pisma';
        } else {
            this.modal.numberInputTextField.$dom.hide();
            //description = '';
        }
    }
    
    onLetterTypeChosen(isOur, resultsetComponent){
        var entityNameLabel = (isOur)? 'Odbiorca' : 'Nadawca';
        resultsetComponent.entityNameReachTextArea.setLabel(entityNameLabel);
        var registrationDateLabel = (isOur)? 'Data nadania' : 'Data wpływu';
        resultsetComponent.registrationDatePicker.setLabel(registrationDateLabel);
        resultsetComponent.controller.numberRefreshDataSet(isOur);
        
        if(isOur){
            resultsetComponent.controller.modal.templateSelectField.$dom.show();
        } else {
            resultsetComponent.controller.modal.templateSelectField.$dom.hide();
            LettersSetup.documentTemplatesRepository.currentItem = undefined;
        }
    }
    
    onContractChosen(chosenItem){
        LettersSetup.contractsRepository.currentItem = chosenItem;
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
        var index = Tools.arrGetIndexOf(this.input.value, 'id', caseDataItem.id); 
        this.modal.selectedCasesHiddenInput.value.splice(index, 1);
    }
    
    initFileInput(){
        var description;
        var _this = this;
        var refreshDataSet = function(){
                    var $descriptionLabel = this.input.$dom.parent().find('.envi-input-description')
                    if($descriptionLabel.length==0){
                        $descriptionLabel = $('<div class="envi-input-description">');
                        this.input.$dom.parent().prepend($descriptionLabel);
                    }
                    $descriptionLabel.html(_this.setFileInputDescription());
                };
        if(this.modal.mode=='ADD_NEW')
            description = 'Wybierz jeden lub wiele plików. Aby wybrać kilka plików klikaj w nie trzymając cały czas wciśnięty klaiwsz [CTRL]';
        
        return {input: this.modal.letterFileInput,
                refreshDataSet: refreshDataSet,
                description: description,
                dataItemKeyName: '_blobEnviObjects',
               }
    }
    setFileInputDescription(){
        var description;
         if(this.modal.mode=='EDIT' && LettersSetup.lettersRepository.currentItem._canUserChangeFileOrFolder){
            this.modal.letterFileInput.$dom.show();
            description = 'Jeżeli edytujesz pismo i nie chcesz zmieniać załącznika, zignoruj to pole';
        } else if (this.modal.mode=='EDIT'){
            this.modal.letterFileInput.$dom.hide();
            description = 'Nie masz uprawnień do zmiany plików tego pisma. Może to zrobić tylko: ' + LettersSetup.lettersRepository.currentItem._fileOrFolderOwnerEmail;
        }
        return description;
    }
};