"use strict";
class IssueModalContractor extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.contractorsDescriptionReachTextArea = new ReachTextArea(this.id + '_contractorsdescriptionReachTextArea', 'Opis', false, 500);
        this.solvedDatePicker = new DatePicker(this.id + 'solvedDatePickerField', 'Data wykonania', true);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(IssuesSetup.statusNames);
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id + '_personAutoCompleteTextField', 'Imię i nazwisko', 'person', false, 'Wybierz imię i nazwisko');
        this.personAutoCompleteTextField.initialise(MainSetup.personsPerProjectRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
        this.formElements = [
            { input: this.contractorsDescriptionReachTextArea,
                dataItemKeyName: 'contractorsDescription'
            },
            { input: this.solvedDatePicker,
                dataItemKeyName: 'solvedDate'
            },
            { input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            { input: this.personAutoCompleteTextField,
                dataItemKeyName: '_owner'
            }
        ];
        this.initialise();
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = { contractId: this.connectedResultsetComponent.connectedRepository.parentItemId
        };
    }
}
