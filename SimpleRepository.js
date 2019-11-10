class SimpleRepository extends Repository {
    /*
     * 
     * @param {String || Object} initParemeter może to być nazwa repozytorim, albo obiekt z session Strorage
     * @param {String} getItemsListServerFunctionName
     * @param {String} addNewServerFunctionName
     * @param {String} editServerFunctionName
     * @param {String} deleteServerFunctionName
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
    addNewItem(dataItem, viewObject) {
        return this.doAddNewFunctionOnItem(dataItem, this.addNewServerFunctionName, viewObject);
        return new Promise((resolve, reject) => {
            super.addNewItem(dataItem,this.addNewServerFunctionName,viewObject)
                  .then((res) => {  //this.items.push(res)
                                    //this.currentItem = res;
                                    console.log('dodano element: ', res);
                                 });
        });
    }
    
    //Krok 2 - wywoływana przy SUBMIT
    editItem(dataItem, viewObject) {
        return this.doChangeFunctionOnItem(dataItem, this.editServerFunctionName, viewObject);
    }
    
    /*
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Collection
     */
    deleteItem(item, viewObject) {
        return new Promise((resolve, reject) => {
            super.deleteItem(item,this.deleteServerFunctionName, viewObject)
                    .then ((res)=> {//var index = this.items.findIndex( item => item.id == res.id); 
                                    //this.items.splice(index,1);
                                    console.log('usunięto: ', res)
                                    resolve(this.name + ': item deleted');
                           });
        });
    }
    
    /*
     * wykonuje dowolną funkcję z serwera dotyczącą danej pozycji na liście viewObject
     */
    doChangeFunctionOnItem(dataItem, serverFunctionName, viewObject) {
        return new Promise((resolve, reject) => {
            super.editItem(dataItem,serverFunctionName, viewObject)
                  .then((res) => {  var newIndex = this.items.findIndex(item => item.id == res.id
                                                      ); 
                                    this.items[newIndex] = res;
                                    console.log('wykonano funkcję: %s', serverFunctionName, res);
                                 })
        });
    }
    /*
     * wykonuje dowolną funkcję  z serwera polegającą na utworzeniu pozycji na liście viewObject
     */
    doAddNewFunctionOnItem(dataItem, serverFunctionName, viewObject) {
        return new Promise((resolve, reject) => {
            super.addNewItem(dataItem,serverFunctionName, viewObject)
                  .then((res) => {  console.log('wykonano funkcję: %s', serverFunctionName, res);
                                 })
        });
    }
};