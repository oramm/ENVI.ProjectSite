class RoleModal extends Modal {
    constructor(id, tittle, connectedResultsetComponent, mode){
        super(id, tittle, connectedResultsetComponent, mode);
        
        this.descriptionReachTextArea = new ReachTextArea (this.id + 'descriptionReachTextArea','Opis', true, 500);
        
        this.formElements = [
            {   input: new InputTextField (this.id + 'nameTextField','Nazwa roli', undefined, true, 150),
                dataItemKeyName: 'name'
            },
            {   input: this.descriptionReachTextArea,
                dataItemKeyName: 'description'
            }
        ];
        this.initialise();
    }
    /*
     * Używana przy włączaniu Modala w celu dodania nowego rekordu
     * @returns {undefined}
     */
    initAddNewData(){
        this.connectedResultsetComponent.connectedRepository.currentItem.projectId = RolesSetup.rolesRepository.parentItemId; 
    }
};