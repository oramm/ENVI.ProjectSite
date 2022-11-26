"use strict";
class ProjectsDetailsModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.controller = new ProjectModalController(this);
        this.commentReachTextArea = new ReachTextArea(this.id + '_commentReachTextArea', 'Opis techniczny', false, 500);
        this.financialCommentReachTextArea = new ReachTextArea(this.id + '_financialCommentReachTextArea', 'Opis finansowy', false, 500);
        this.statusSelectField = new SelectField(this.id + '_statusSelectField', 'Status', true);
        this.statusSelectField.initialise(['Nie rozpoczęty', 'W trakcie', 'Zakończony']);
        this.employerAutoCompleteTextField = new AutoCompleteTextField(this.id + '_employerAutoCompleteTextField', 'Dodaj zamawiającego', 'business', false, 'Wybierz nazwę');
        this.employerAutoCompleteTextField.initialise(MainSetup.entitiesRepository, 'name', this.controller.onEmployerChosen, this.controller);
        this.selectedEmployersHiddenInput = new HiddenInput(this.id + '_currentEmployersHiddenInput', undefined, false);
        var _this = this;
        this.formElements = [
            {
                input: new InputTextField(this.id + '_idTextField', 'Oznaczenie projektu', undefined, true, 150),
                dataItemKeyName: 'ourId'
            },
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa', undefined, true, 300),
                dataItemKeyName: 'name'
            },
            {
                input: new InputTextField(this.id + '_aliasTextField', 'Alias projektu', undefined, true, 30),
                description: 'Podaj krótką etykietę pomocną w wyszukiwaniu w systemie',
                dataItemKeyName: 'alias'
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
            },
            {
                input: new DatePicker(this.id + 'startDatePickerField', 'Rozpoczęcie', true),
                dataItemKeyName: 'startDate'
            },
            {
                input: new DatePicker(this.id + 'endDatePickerField', 'Zakończenie realizacji', true),
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
                input: this.financialCommentReachTextArea,
                desciption: 'Te dane wprowadza koordynator finansowy projektu',
                dataItemKeyName: 'financialComment'
            },
            {
                input: new InputTextField(this.id + 'totalValueTextField', 'Wartość całkowota netto', undefined, true, 20),
                dataItemKeyName: 'totalValue'
            },
            {
                input: new InputTextField(this.id + 'qualifiedValueTextField', 'Koszty kwalifikowane', undefined, true, 20),
                dataItemKeyName: 'qualifiedValue'
            },
            {
                input: new InputTextField(this.id + 'dotationValueTextField', 'Wartość dotacji', undefined, true, 20),
                dataItemKeyName: 'dotationValue'
            }
        ];
        this.initialise();
    }
}
;
