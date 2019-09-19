class ReceivedLetterModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        this.contractSelectField = new SelectField(this.id + '_contractSelectField', 'Kontrakt', undefined, false);
        this.contractSelectField.initialise(LettersSetup.contractsRepository.items, '_ourIdOrNumber_Name',this.onContractChosen, this);
        
        this.milestoneSelectField = new SelectField(this.id + '_milestoneSelectField', 'Kamień Milowy', undefined, false);
        this.caseSelectField = new SelectField(this.id + '_caseSelectField', 'Sprawa', undefined, false);
        this.selectedCasesHiddenInput = new HiddenInput (this.id + '_currentCasesHiddenInput');
        
        var _this=this;
        
        this.formElements = [
            {   input: new SwitchInput('Przychodzące', 'Wysłane'),
                dataItemKeyName: 'isOur'
            },
            {   input: this.contractSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_contract',
            },
            {   input: this.milestoneSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_milestone',
                initialize(){
                    var currentMilestones = LettersSetup.milestonesRepository.items.filter(
                            item=>  item._parent.id == LettersSetup.contractsRepository.currentItem.id
                        );
                    this.input.initialise(currentMilestones, '_FolderNumber_TypeName_Name',_this.onMilestoneChosen, _this);
                }
            },
            {   input: this.caseSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_case',
                initialize(){
                    var currentCases = LettersSetup.casesRepository.items.filter(
                            item=>  item._parent.id == LettersSetup.milestonesRepository.currentItem.id &&
                                    this.checkCase(item)
                        );
                    this.input.initialise(currentCases, '_typeFolderNumber_TypeName_Number_Name',_this.onCaseChosen, _this);
                },
                checkCase(caseItem){
                    //wyklucz sprawy wybrane już wcześniej
                    var allowType = true;
                    _this.selectedCasesHiddenInput.value.map(existingCaseItem=>{
                        if (existingCaseItem.id==caseItem.id)
                                allowType = false;
                    });
                    return allowType;//caseTypeItem.milestoneTypeId==CasesSetup.currentMilestone._type.id;
                }
            },
            {   input: this.selectedCasesHiddenInput,
                dataItemKeyName: '_cases',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet(){
                    this.input.$dom.parent().children('.chip').remove();
                    if (_this.mode=='ADD_NEW')
                        this.input.value = [];
                    if (_this.mode=='EDIT') {
                        this.input.value = LettersSetup.lettersRepository.currentItem._cases;
                        for (var i=0; i<this.input.value.length; i++){
                            this.appendCaseChip(this.input.value[i]);
                        }
                    }
                },
                
                addCaseItem(caseDataItem){
                    this.input.value.push(caseDataItem);
                    this.appendCaseChip(caseDataItem);
                },
                
                appendCaseChip(caseDataItem){
                    var chipLabel;
                    if(caseDataItem._parent._parent.ourId)
                        chipLabel = caseDataItem._parent._parent.ourId;
                    else chipLabel = caseDataItem._parent._parent.number;
                    chipLabel += ', ' + caseDataItem._parent._type._folderNumber + ' ' + 
                                 caseDataItem._parent._type.name + 
                                 ' | '
                    chipLabel += caseDataItem._typeFolderNumber_TypeName_Number_Name
                    this.input.$dom.parent().prepend(new Chip('case_', 
                                                          chipLabel,
                                                          caseDataItem,
                                                          _this.onCaseUnchosen,
                                                          _this).$dom);
                    
                },
                //usuwa caseItem z listy HiddenInput.value[]
                removeCaseItem(caseDataItem){
                    var index = Tools.arrGetIndexOf(this.input.value, 'id', caseDataItem); 
                    this.input.value.splice(index, 1);
                }
                
            },
            {   input: new DatePicker(this.id + '_datePickerField','Data sporządzenia', undefined, true),
                dataItemKeyName: 'creationDate'
            },
            {   input: new DatePicker(this.id + '_registrationDatePickerField','Data wpływu', undefined, true),
                dataItemKeyName: 'registrationDate'
            },
            {   input: new InputTextField (this.id + 'numberTextField','Numer pisma', undefined, true, 25),
                dataItemKeyName: 'number',
            },
            {   input: new ReachTextArea (this.id + '_entityNameReachTextArea','Nadawca', true, 300),
                dataItemKeyName: 'entityName'
            },
            {   input: new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 300),
                dataItemKeyName: 'description'
            },
            {   input: new FileInput (this.id + '_letter_FileInput','Wybierz plik', this, true),
                description: (this.mode=='EDIT')?'Jeżeli edytujesz pismo i nie chcesz zmieniać załącznika, zignoruj to pole' : '',
                dataItemKeyName: '_blobEnviObjects',
            }
        ];
        this.initialise();
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [],
            _project: LettersSetup.currentProject
            };
        LettersSetup.casesRepository.currentItems=[];
    }
    
    onContractChosen(chosenItem){
        LettersSetup.contractsRepository.currentItem = chosenItem;
        this.formElements[2].initialize(chosenItem);
    }
    
    onMilestoneChosen(chosenItem){
        LettersSetup.milestonesRepository.currentItem = chosenItem;
        this.formElements[3].initialize(chosenItem);
    }
    
    onCaseChosen(chosenItem){
        //LettersSetup.casesRepository.addToCurrentItems(chosenItem);
        this.formElements[4].addCaseItem(chosenItem);
        this.formElements[3].initialize(chosenItem);
        
    }
    
    onCaseUnchosen(unchosenItem){
        //LettersSetup.casesRepository.deleteFromCurrentItems(unchosenItem);
        this.formElements[4].removeCaseItem(unchosenItem);
    }
};