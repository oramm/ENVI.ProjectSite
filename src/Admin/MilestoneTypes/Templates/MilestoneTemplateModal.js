class MilestoneTemplateModal extends Modal {
    constructor(id, title, connectedResultsetComponent, mode) {
        super(id, title, connectedResultsetComponent, mode);

        this.descriptionReachTextArea = new ReachTextArea(this.id + 'descriptionReachTextArea', 'Opis', false, 500);

        this.formElements = [
            {
                input: new InputTextField(this.id + 'nameTextField', 'Dopisek', undefined, false, 50),
                dataItemKeyName: 'name',
                refreshDataSet: function () {
                    //użytkownik edytuje 
                    if (ContractTypesSetup.milestoneTypesRepository.currentItem.isUniquePerContract) {
                        this.input.$dom.hide();
                    } else
                        this.input.$dom.show();
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
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData() {
        this.connectedResultsetComponent.connectedRepository.currentItem = {
            _milestoneType: ContractTypesSetup.milestoneTypesRepository.currentItem
        };
    }
    /*
     onContractChosen(chosenItem){
         this.formElements[1].refreshDataSet();
     }
     */
};