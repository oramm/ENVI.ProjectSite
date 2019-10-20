class LetterModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        this.controller = new LetterModalController(this);
        this.isOurSwitchInput = new SwitchInput('Przychodzące', 'Wysłane', this.controller.onLetterTypeChosen, this.controller);
        this.contractSelectField = new SelectField(this.id + '_contractSelectField', 'Kontrakt', undefined, this.mode==='ADD_NEW');
        this.contractSelectField.initialise(LettersSetup.contractsRepository.items, '_ourIdOrNumber_Name',this.controller.onContractChosen, this.controller);
        
        this.templateSelectField = new SelectField(this.id + '_templateSelectField', 'Szablon', undefined, false);
        this.templateSelectField.initialise(LettersSetup.documentTemplatesRepository.items, 'name',this.controller.onTemplateChosen, this.controller);
        
        this.milestoneSelectField = new SelectField(this.id + '_milestoneSelectField', 'Kamień Milowy', undefined, false);
        this.caseSelectField = new SelectField(this.id + '_caseSelectField', 'Sprawa', undefined, false);
        this.selectedCasesHiddenInput = new HiddenInput (this.id + '_currentCasesHiddenInput', undefined, false);
        this.numberInputTextField = new InputTextField (this.id + 'numberTextField','Numer pisma', undefined, false, 25);
        this.entityNameReachTextArea = new ReachTextArea (this.id + '_entityNameReachTextArea','Nadawca', true, 300);
        this.registrationDatePicker = new DatePicker(this.id + '_registrationDatePickerField','Data wpływu', undefined, true);
        this.letterFileInput = new FileInput (this.id + '_letter_FileInput','Wybierz plik', this, true);
        
        var _this=this;
        
        this.numberFormElement = {  input: this.numberInputTextField,
                                    description: 'Nadaj ręcznie numer pisma',
                                    dataItemKeyName: '_numberFromClient',
                                    refreshDataSet(){
                                        _this.controller.initNumberInput();
                                    }
                                 };
        this.fileInput = {  input: this.letterFileInput,
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
            {   input: this.entityNameReachTextArea,
                dataItemKeyName: 'entityName'
            },
            {   input: new ReachTextArea (this.id + '_descriptonReachTextArea','Opis', false, 300),
                dataItemKeyName: 'description'
            },
            this.fileInput
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