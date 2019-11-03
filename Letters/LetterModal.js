class LetterModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        this.controller = new LetterModalController(this);
        this.isOurSwitchInput = new SwitchInput('Przychodzące', 'Wysłane', this.controller.onLetterTypeChosen, this.controller);
        this.numberInputTextField = new InputTextField (this.id + 'numberTextField','Numer pisma', undefined, false, 25);
        
        this.contractSelectField = new SelectField(this.id + '_contractSelectField', 'Kontrakt', undefined, this.mode==='ADD_NEW');
        this.contractSelectField.initialise(LettersSetup.contractsRepository.items, '_ourIdOrNumber_Name',this.controller.onContractChosen, this.controller);
        
        this.templateSelectField = new SelectField(this.id + '_templateSelectField', 'Szablon', undefined, false);
        this.templateSelectField.initialise(LettersSetup.documentTemplatesRepository.items, 'name',this.controller.onTemplateChosen, this.controller);
        
        this.milestoneSelectField = new SelectField(this.id + '_milestoneSelectField', 'Kamień Milowy', undefined, false);
        this.caseSelectField = new SelectField(this.id + '_caseSelectField', 'Sprawa', undefined, false);
        this.selectedCasesHiddenInput = new HiddenInput (this.id + '_currentCasesHiddenInput', undefined, false);
        
        this.entityMainAutoCompleteTextField = new AutoCompleteTextField(this.id+'_entityMainAutoCompleteTextField',
                                                                     'Dodaj Nadawcę', 
                                                                     'business', 
                                                                     false, 
                                                                     'Wybierz nazwę')
        this.entityMainAutoCompleteTextField.initialise(LettersSetup.entitiesRepository,'name',this.controller.onEntityMainChosen,this.controller);
        this.selectedEntitiesMainHiddenInput = new HiddenInput (this.id + '_currentEntitiesMainHiddenInput', undefined, true);
        
        this.registrationDatePicker = new DatePicker(this.id + '_registrationDatePickerField','Data wpływu', undefined, true);
        this.letterFileInput = new FileInput (this.id + '_letter_FileInput','Wybierz plik', this, this.mode==='ADD_NEW');
        
        var _this=this;
        
        this.numberFormElement = {  input: this.numberInputTextField,
                                    description: 'Nadaj ręcznie numer pisma',
                                    dataItemKeyName: 'number',
                                    refreshDataSet(){
                                        _this.controller.initNumberInput();
                                    }
                                 };
        this.fileFormElement = {    input: this.letterFileInput,
                                    description: '',
                                    dataItemKeyName: '_blobEnviObjects',
                                    refreshDataSet(){
                                        _this.controller.initFileInput();
                                    }
                                };
        
        this.formElements = [
            {   input: this.isOurSwitchInput,
                dataItemKeyName: 'isOur',
                refreshDataSet(){
                    _this.controller.initIsOurSwitchInput();
                }
            },
            {   input: this.templateSelectField,
                description: 'Jeżeli rejestrujesz pismo po nowemu wybierz szablon. W przeciwnym razie zignoruj to pole i nadaj ręcznie numer pisma',
                dataItemKeyName: '_template',
            },
            this.numberFormElement,
            {   input: this.contractSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_contract',
            },
            {   input: this.milestoneSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_milestone'
            },
            {   input: this.caseSelectField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnej sprawy do pisma, możesz to pole zignorować' : '',
                dataItemKeyName: '_case'
            },
            {   input: this.selectedCasesHiddenInput,
                dataItemKeyName: '_cases',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet(){
                    _this.controller.initCasesChips();
                }
            },
            {   input: new DatePicker(this.id + '_datePickerField','Data sporządzenia', undefined, true),
                dataItemKeyName: 'creationDate'
            },
            {   input: this.registrationDatePicker,
                dataItemKeyName: 'registrationDate'
            },
            {   input: this.entityMainAutoCompleteTextField,
                description: (this.mode=='EDIT')? 'Jeżeli nie chcesz przypisywać kolejnego podmiotu, możesz to pole zignorować' : '',
                dataItemKeyName: '_entityMain'
            },
            {   input: this.selectedEntitiesMainHiddenInput,
                dataItemKeyName: '_entitiesMain',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet(){
                    _this.controller.initEntitiesMainChips();
                }
            },
            {   input: new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 300),
                dataItemKeyName: 'description'
            },
            this.fileFormElement
        ];
        this.initialise();
    }

    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.controller.initAddNewDataHandler();
    }
};
