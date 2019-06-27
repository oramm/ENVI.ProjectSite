class CaseModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);
        var _this = this;
        this.typeSelectField = new SelectField(this.id + 'typeSelectField', 'Typ sprawy', undefined, false);
        this.typeSelectField.$select.on('change', function() {
               _this.formElements[1].refreshDataSet();
            });
        this.typeSelectField.initialise(CasesSetup.caseTypesRepository.items, 'name');
        this.formElements = [
            {   input: this.typeSelectField,
                dataItemKeyName: '_type',                                  
            },
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa sprawy', undefined, false, 150),
                dataItemKeyName: 'name',
                refreshDataSet: function (){    
                        //użytkownik edytuje 
                        if(_this.typeSelectField.getChosenItem() && _this.typeSelectField.getChosenItem().isUniquePerMilestone){
                            this.input.$dom.hide();
                        } else
                            this.input.$dom.show();
                    },
            },
            {   input: new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300),
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    /*
     * inicjuje dane przed dodaniem nowego elementu - czyści CurrentItem i ew. ustawia zmienne kontekstowe niewyświetlane w modalu
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem = { _parent: CasesSetup.currentMilestone
                                                                           };
    }
};