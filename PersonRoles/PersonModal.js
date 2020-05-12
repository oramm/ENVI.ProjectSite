class PersonModal extends Modal {
    constructor(id, title, connectedResultsetComponent) {
        super(id, title, connectedResultsetComponent, 'ADD_NEW');

        this.entityAutocompleteTextField = new AutoCompleteTextField(this.id + 'entityAutoCompleteTextField',
            'Firma',
            'business_center',
            true,
            'Wybierz nazwę podmiotu z listy')
        
        var _this = this;
        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Imię', undefined, true, 100),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(this.id + 'surnameTextField', 'Nazwisko', undefined, true, 50, '.{3,}'),
                dataItemKeyName: 'surname'
            },
            {
                input: new InputTextField(this.id + 'positionTextField', 'Stanowisko', undefined, false, 50, '.{3,}'),
                dataItemKeyName: 'position'
            },
            {
                input: new InputTextField(this.id + 'emailTextField', 'E-mail', undefined, true, 50),
                dataItemKeyName: 'email'
            },
            {
                input: this.entityAutocompleteTextField,
                dataItemKeyName: '_entity',
                refreshDataSet() {
                    _this.entityAutocompleteTextField.initialise(MainSetup.entitiesRepository, "name", this.onEntityChosen, this);
                }
            },
            {
                input: new InputTextField(this.id + 'cellphoneTextField', 'Tel. kom.', undefined, false, 25, '.{7,}'),
                dataItemKeyName: 'cellphone'
            },
            {
                input: new InputTextField(this.id + 'phoneTextField', 'Tel.', undefined, false, 25, '.{7,}'),
                dataItemKeyName: 'phone'
            },
            {
                input: new ReachTextArea (this.id + 'commentReachTextArea','Uwagi', false, 300),
                dataItemKeyName: 'comment'
            }
        ];
        this.initialise();
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
         
        }
        this.entityAutocompleteTextField.initialise(MainSetup.entitiesRepository, "name", this.onEntityChosen, this);
        this.entityAutocompleteTextField.setValue(MainSetup.entitiesRepository.currentItem);
    }
};