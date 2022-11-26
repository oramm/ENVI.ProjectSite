"use strict";
class ProcessStepsInstancesModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.statusSelectField = new SelectField(this.id + 'statusSelectField', 'Status', true);
        this.statusSelectField.initialise(ProcessesInstancesSetup.processesStepsInstancesStatusNames);
        this.deadLinePicker = new DatePicker(this.id + 'deadLinePickerField', 'Termin wykonania', true);
        this.formElements = [
            { input: this.statusSelectField,
                dataItemKeyName: 'status'
            },
            { input: this.deadLinePicker,
                dataItemKeyName: 'deadline'
            }
        ];
        this.initialise();
    }
}
;
