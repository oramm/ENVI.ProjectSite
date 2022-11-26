"use strict";
class CaseTemplateModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);
        this.formElements = [
            { input: new InputTextField(this.id + 'nameTextField', 'Nazwa sprawy', undefined, false, 150),
                dataItemKeyName: 'name',
                refreshDataSet: function () {
                    //użytkownik edytuje 
                    if (CaseTypesSetup.caseTypesRepository.currentItem.isUniquePerMilestone) {
                        this.input.$dom.hide();
                    }
                    else
                        this.input.$dom.show();
                }
            },
            { input: new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', false, 300),
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = { _caseType: CaseTypesSetup.caseTypesRepository.currentItem
        };
    }
}
;
