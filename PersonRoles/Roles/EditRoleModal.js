class EditRoleModal extends RoleModal {
    constructor(id, tittle, connectedResultsetComponent){
        super(id, tittle, connectedResultsetComponent);
    }
        
    /*
     * Krok 1 - po kliknięciu 'Submit' formularza dodawania
     * Proces: this.submitTrigger >> rolesRepository.addNewPerson
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[PENDING]
     *                                  >> repository. addNewHandler >> personsRolesCollection.addNewHandler[DONE]
    */
    submitTrigger(){
        super.submitTrigger();
        
        if(this.wasChanged(this.dataObject)){
            rolesRepository.editItem(rolesRepository.currentItem, this.connectedResultsetComponent);
        } else {
            alert("Taka osoba już jest w bazie!");
        }
    }
    
    wasChanged(externalAchievement){
        var check = rolesRepository.items.find(item => Tools.areEqualObjects(externalAchievement,item))   
        return (check === undefined)? true : false;
    }
};