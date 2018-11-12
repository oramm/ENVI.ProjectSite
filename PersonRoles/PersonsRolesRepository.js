class PersonsRolesRepository extends SimpleRepository {
    constructor(name, 
                getItemsListServerFunctionName, 
                addNewServerFunctionName, 
                editServerFunctionName, 
                deleteServerFunctionName,
                getNewItemDataServerFunctionName){
        super(  name, 
                getItemsListServerFunctionName, 
                addNewServerFunctionName, 
                editServerFunctionName, 
                deleteServerFunctionName);
        this.getNewItemDataServerFunctionName = getNewItemDataServerFunctionName;
    }
    
    /*
     * uzupełnia dane nowego rekordu na podstawie kluczy z asocjacji
     */
    getNewItemData(item){
        return new Promise((resolve, reject) => {
            this.doServerFunction(this.getNewItemDataServerFunctionName,item)
                .then(result => resolve(result)
                     );
        });
    }
    //Krok 2 - wywoływana przy SUBMIT
    addNewItem(item, viewObject) {
        return new Promise((resolve, reject) => {
            this.getNewItemData(item)
                    .then((filledItem) => super.addNewItem(filledItem,viewObject));
        });
    }
};
