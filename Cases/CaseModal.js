class CaseModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent,mode);
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa sprawy', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', false, 300),
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }    
};