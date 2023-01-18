"use strict";
class SimpleRepository extends Repository {
    /*
     *
     * @param {String || Object} initParameter może to być nazwa repozytorim, albo obiekt z session Strorage
     * @param {String} addNewServerFunctionName
     * @param {String} editServerFunctionName
     * @param {String} deleteServerFunctionName
     * @returns {SimpleRepository}
     */
    constructor(initParameter, name, addNewServerFunctionName, editServerFunctionName, deleteServerFunctionName, copyServerFunctionName = addNewServerFunctionName) {
        super(initParameter, name);
        if (initParameter?.parentItemId)
            this.parentItemId = initParameter.parentItemId;
        else
            this.parentItemIdFromURL();
        //stary typ repozytium
        if (name) {
            this.addNewServerFunctionName = addNewServerFunctionName;
            this.editServerFunctionName = editServerFunctionName;
            this.deleteServerFunctionName = deleteServerFunctionName;
            this.copyServerFunctionName = copyServerFunctionName;
            sessionStorage.setItem(this.name, JSON.stringify(this));
        }
        //mamy obiekt z SessionStorage lub nowy obiekt z nodeJS
        else if (typeof initParameter === 'object') {
            this.addNewServerFunctionName = initParameter.addNewServerFunctionName;
            this.editServerFunctionName = initParameter.editServerFunctionName;
            this.deleteServerFunctionName = initParameter.deleteServerFunctionName;
        }
    }
    initialiseNodeJS(requestParams) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: MainSetup.serverUrl + requestParams,
                success: (response) => {
                    this.items = response;
                    sessionStorage.setItem(this.name, JSON.stringify(this));
                    console.log(this.name + ' NodeJS: %o', response);
                    resolve(this.name + " initialised");
                },
                error: (xhr, status, err) => {
                    console.log(xhr.responseText);
                    alert(xhr.responseText);
                }
            });
        });
    }
    //najczęściej jest to projectId
    parentItemIdFromURL() {
        this.parentItemId = Tools.getUrlVars()['parentItemId'];
    }
    //Krok 2 - wywoływana przy SUBMIT
    addNewItem(dataItem, viewObject) {
        return this.doAddNewFunctionOnItem(dataItem, this.addNewServerFunctionName, viewObject);
        //super.addNewItem(dataItem, this.addNewServerFunctionName, viewObject);
    }
    //Krok 2 - wywoływana przy SUBMIT
    editItem(dataItem, viewObject) {
        let argument;
        if (this.actionsNodeJSSetup?.editRoute)
            argument = this.actionsNodeJSSetup.editRoute;
        else {
            if (!this.editServerFunctionName)
                throw new Error('Repository does not have editServerFunctionName');
            argument = this.editServerFunctionName;
        }
        return this.doChangeFunctionOnItem(dataItem, argument, viewObject);
    }
    /**
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Resultset
     */
    async deleteItem(dataItem, viewObject) {
        if (this.actionsNodeJSSetup?.deleteRoute)
            await super.deleteItemNodeJS(dataItem, this.actionsNodeJSSetup.deleteRoute, viewObject);
        else {
            if (!this.deleteServerFunctionName)
                throw new Error('Repository does not have deleteServerFunctionName');
            await super.deleteItem(dataItem, this.deleteServerFunctionName, viewObject);
        }
        return this.name + ': item deleted';
    }
    async copyCurrentItem(viewObject) {
        return await this.copyItem(this.currentItem, viewObject);
    }
    async copyItem(dataItem, viewObject) {
        let tmpDataObject = Tools.cloneOfObject(dataItem);
        tmpDataObject.id = undefined;
        let result;
        if (this.actionsNodeJSSetup?.copyRoute)
            result = await super.addNewItemNodeJS(dataItem, this.actionsNodeJSSetup.copyRoute, viewObject);
        else {
            if (!this.copyServerFunctionName)
                throw new Error('Repository does not have copyServerFunctionName');
            result = await super.addNewItem(tmpDataObject, this.copyServerFunctionName, viewObject);
        }
        return result;
    }
    /**
     * wykonuje dowolną funkcję z serwera dotyczącą danej pozycji na liście viewObject
     */
    async doChangeFunctionOnItem(dataItem, serverFunctionNameOrRoute, viewObject) {
        let result;
        if (this.actionsNodeJSSetup?.editRoute)
            result = await super.editItemNodeJS(dataItem, serverFunctionNameOrRoute, viewObject);
        else
            result = await super.editItem(dataItem, serverFunctionNameOrRoute, viewObject);
        let newIndex = this.items.findIndex((item) => item.id == result.id);
        this.items[newIndex] = result;
        console.log('%s:: wykonano funkcję: %s', this.name, serverFunctionNameOrRoute, result);
        return (result);
    }
    /**
     * wykonuje dowolną funkcję  z serwera polegającą na utworzeniu pozycji na liście viewObject
     */
    async doAddNewFunctionOnItem(dataItem, serverFunctionName, viewObject) {
        let result;
        if (this.actionsNodeJSSetup?.addNewRoute)
            result = await super.addNewItemNodeJS(dataItem, this.actionsNodeJSSetup.addNewRoute, viewObject);
        else {
            if (!serverFunctionName)
                throw new Error('serverFunctionName must be defined');
            result = await super.addNewItem(dataItem, serverFunctionName, viewObject);
        }
        console.log('%s:: wykonano funkcję: %s, %o', this.name, serverFunctionName, result);
        return result;
    }
}
;
