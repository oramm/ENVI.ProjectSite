class SimpleRepository extends Repository {
    /*
     * 
     * @param {String || Object} initParemeter może to być nazwa repozytorim, albo obiekt z session Strorage
     * @param {type} getItemsListServerFunctionName
     * @param {type} addNewServerFunctionName
     * @param {type} editServerFunctionName
     * @param {type} deleteServerFunctionName
     * @returns {SimpleRepository}
     */
    constructor(initParemeter, 
                getItemsListServerFunctionName, 
                addNewServerFunctionName, 
                editServerFunctionName, 
                deleteServerFunctionName){
        super(initParemeter);
        this.parentItemId = initParemeter.parentItemId;
        if (typeof initParemeter === 'string'){
            this.getItemsListServerFunctionName = getItemsListServerFunctionName
            this.addNewServerFunctionName = addNewServerFunctionName;
            this.editServerFunctionName = editServerFunctionName;
            this.deleteServerFunctionName = deleteServerFunctionName;
             
            this.parentItemIdFromURL();
            sessionStorage.setItem(this.name, JSON.stringify(this));
        }
    }
    
    initialise(serverFunctionParameters) {
        return new Promise((resolve, reject) => {
            this.doServerFunction(this.getItemsListServerFunctionName,serverFunctionParameters)
                .then(result => {   this.items = result;
                                    sessionStorage.setItem(this.name, JSON.stringify(this));
                                    resolve(this.name + " initialised");  
                                });
        });
    }
    //najczęściej jest to projectId
    parentItemIdFromURL() {
        return new Promise((resolve, reject) => {
            this.parentItemId = Tools.getUrlVars()['parentItemId'];
            
        });
    }
      
    //Krok 2 - wywoływana przy SUBMIT
    addNewItem(item, viewObject) {
        return new Promise((resolve, reject) => {
            this.currentItem = item;
            super.addNewItem(item,this.addNewServerFunctionName,viewObject)
                  .then((res) => {  this.items.push(res)
                                    this.currentItem = res;
                                    console.log('dodano element: ', res);
                                 });
        });
    }
    
    //Krok 2 - wywoływana przy SUBMIT
    editItem(person, viewObject) {
        return new Promise((resolve, reject) => {
            super.editItem(person,this.editServerFunctionName, viewObject)
                  .then((res) => {  var newIndex = this.items.findIndex( item => item.id == res.id
                                                      ); 
                                    this.items[newIndex] = res;
                                    console.log('zmieniono dane : ', res);
                                 })
        });
    }
    
    /*
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Collection
     */
    deleteItem(item, viewObject) {
        return new Promise((resolve, reject) => {
            super.deleteItem(item,this.deleteServerFunctionName, viewObject)
                    .then ((res)=> {var index = this.items.findIndex( item => item.id == res.id); 
                                    this.items.splice(index,1);
                                    console.log('usunięto: ', res)
                                    resolve(this.name + ': item deleted');
                           });
        });
    }
};