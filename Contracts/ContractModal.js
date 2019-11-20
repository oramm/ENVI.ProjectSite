class ContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode) {
        super(id, tittle, connectedResultsetComponent, mode);
        this.controller = new ContractModalController(this);

        var notOurTypes = ContractsSetup.contractTypesRepository.items.filter(item => !item.isOur)
        this.typeSelectField = new SelectField(this.id + '_type_SelectField', 'Typ kontraktu', undefined, true);
        this.typeSelectField.initialise(notOurTypes, 'name');

        this.commentReachTextArea = new ReachTextArea(this.id + '_commentReachTextArea', 'Opis', false, 1000);

        this.ourIdRelatedSelectField = new SelectField(this.id + '_ourIdRelated_SelectField', 'Powiązana usługa IK lub PT', undefined, true);
        this.ourIdRelatedSelectField.initialise(this.makeOurPtIds(), '_ourIdName');
        this.statusSelectField = new SelectField(this.id + '_status_SelectField', 'Status', undefined, true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);

        this.contractorAutoCompleteTextField = new AutoCompleteTextField(this.id + '_contractorAutoCompleteTextField',
            'Dodaj wykonawcę',
            'business',
            false,
            'Wybierz nazwę')
        this.contractorAutoCompleteTextField.initialise(ContractsSetup.entitiesRepository, 'name', this.controller.onContractorChosen, this.controller);
        this.selectedContractorsHiddenInput = new HiddenInput(this.id + '_currentContractorsHiddenInput', undefined, false);

        this.employerAutoCompleteTextField = new AutoCompleteTextField(this.id + '_employerAutoCompleteTextField',
            'Dodaj zamawiającego',
            'business',
            false,
            'Wybierz nazwę')
        this.employerAutoCompleteTextField.initialise(ContractsSetup.entitiesRepository, 'name', this.controller.onEmployerChosen, this.controller);
        this.selectedEmployersHiddenInput = new HiddenInput(this.id + '_currentEmployersHiddenInput', undefined, false);

        var _this = this;

        this.formElements = [
            {
                input: this.typeSelectField,
                dataItemKeyName: '_type'
            },
            {
                input: new InputTextField(this.id + 'numberTextField', 'Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa kontraktu', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(this.id + '_aliasTextField', 'Alias kontraktu', undefined, false, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie i w scrumboardzie',
                dataItemKeyName: 'alias'
            },
            {
                input: this.ourIdRelatedSelectField,
                dataItemKeyName: '_ourContract'
            },
            {
                input: new DatePicker(this.id + 'startDatePickerField', 'Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {
                input: new DatePicker(this.id + 'endDatePickerField', 'Termin wykonania', true),
                dataItemKeyName: 'endDate'
            },
            {
                input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            {
                input: this.commentReachTextArea,
                dataItemKeyName: 'comment'
            },
            {
                input: this.contractorAutoCompleteTextField,
                description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego wykonawcy, możesz to pole zignorować' : '',
                dataItemKeyName: '_contractor'
            },
            {
                input: this.selectedContractorsHiddenInput,
                dataItemKeyName: '_contractors',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet() {
                    _this.controller.contractorsChipsRefreshDataSet();
                }
            },
            {
                input: this.employerAutoCompleteTextField,
                description: (this.mode == 'EDIT') ? 'Jeżeli nie chcesz przypisywać kolejnego zamawiającego, możesz to pole zignorować' : '',
                dataItemKeyName: '_employer'
            },
            {
                input: this.selectedEmployersHiddenInput,
                dataItemKeyName: '_employers',
                //ustawia wartość HiddenInput.value[] i chipsy, używana przy otwieraniu okna
                refreshDataSet() {
                    _this.controller.employersChipsRefreshDataSet();
                }
            }
        ];
        this.initialise();
    }
    /*
     * Tworzy listę kontraktów typu IK PT dla danego projektu
     */
    makeOurPtIds() {
        var ourPtIkContracts = ContractsSetup.otherContractsRepository.items.filter(item => item._ourType == 'PT' || item._ourType == 'IK');
        return ourPtIkContracts;
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData() {
        this.controller.initAddNewDataHandler();
    }
};