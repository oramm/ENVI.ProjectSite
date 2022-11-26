"use strict";
class RoleModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', true, 500);
        this.personAutoCompleteTextField = new AutoCompleteTextField(this.id + 'personAutoCompleteTextField', 'Imię i nazwisko', 'person', true, 'Wybierz imię i nazwisko');
        var _this = this;
        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Nazwa roli', undefined, true, 100),
                dataItemKeyName: 'name'
            },
            {
                input: this.personAutoCompleteTextField,
                dataItemKeyName: '_person',
                refreshDataSet() {
                    _this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
                }
            },
            {
                input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem =
            {
                projectOurId: MainSetup.currentProject.ourId,
                _group: this.connectedResultsetComponent.parentDataItem,
                _contract: {}
            };
        this.personAutoCompleteTextField.setValue(MainSetup.personsRepository.currentItem);
        this.personAutoCompleteTextField.initialise(MainSetup.personsRepository, "_nameSurnameEmail", this.onOwnerChosen, this);
    }
}
;
