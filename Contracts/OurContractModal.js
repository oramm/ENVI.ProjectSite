class OurContractModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        var ourTypes = ContractsSetup.contractTypesRepository.items.filter(item=>item.isOur)
        this.typeSelectField = new SelectField(this.id + '_type_SelectField', 'Typ kontraktu', true);
        this.typeSelectField.initialise(ourTypes, 'name');
        
        this.commentReachTextArea = new ReachTextArea (this.id + '_commentReachTextArea','Opis', false, 300);
        
        this.statusSelectField = new SelectField(this.id + '_statusSelectField', 'Status', true);
        this.statusSelectField.initialise(ContractsSetup.statusNames);
        this.managerAutoCompleteTextField = new AutoCompleteTextField(this.id+'_managerAutoCompleteTextField',
                                                                     'Koordynator', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.managerAutoCompleteTextField.initialise(ContractsSetup.personsRepository,"nameSurnameEmail", this.onManagerChosen, this);
        this.adminAutoCompleteTextField = new AutoCompleteTextField(this.id+'_adminAutoCompleteTextField',
                                                                     'Administrator', 
                                                                     'person', 
                                                                     false, 
                                                                     'Wybierz imię i nazwisko')
        this.adminAutoCompleteTextField.initialise(ContractsSetup.personsRepository,"nameSurnameEmail", this.onAdminChosen, this);
        
        this.formElements = [
            {   input: this.typeSelectField,
                dataItemKeyName: '_type'
            },
            {   input: new InputTextField (this.id + 'numberTextField','Numer kontraktu', undefined, true, 150),
                dataItemKeyName: 'number'
            },
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa', undefined, true, 300),
                dataItemKeyName: 'name'
            },
            {   input: new InputTextField (this.id + '_aliasTextField','Alias kontraktu', undefined, false, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie i w scrumboardzie',
                dataItemKeyName: 'alias'
            },
            {   input: new DatePicker(this.id + 'startDatePickerField','Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {   input: new DatePicker(this.id + 'endDatePickerField','Termin wykonania', true),
                dataItemKeyName: 'endDate'
            },
            {   input: new InputTextField (this.id + 'valueTextField','Wartość umowy netto', undefined, true, 20),
                dataItemKeyName: 'value'
            },
            {   input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            {   input: this.commentReachTextArea,
                dataItemKeyName: 'comment'
            },
            {   input: new InputTextField (this.id + 'ourIdTextField','Oznaczenie zlecenia ENVI', undefined, true, 150),
                dataItemKeyName: 'ourId'
            },
            {   input: this.managerAutoCompleteTextField,
                dataItemKeyName: '_manager'
            },
            {   input: this.adminAutoCompleteTextField,
                dataItemKeyName: '_admin'
            }
        ];
        this.initialise();
    }
    /*
     * Przed dodaniem nowego kontraktu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            projectId: this.connectedResultsetComponent.connectedRepository.parentItemId
        };
    }
};