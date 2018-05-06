
class Contract {
    constructor(id, number, name, projectId, startDate, endDate, value, description, editUrl, copyUrl){
        this.id = id;
        this.number = number; 
        this.name = name;
        this.projectId = projectId;
        this.value = value;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.editUrl = editUrl;
        this.copyUrl = copyUrl;
    }
}

class ContractsRepository extends Repository{
    constructor(){
        super("Contracts List", "getContractsList", "deleteContract");
        this.projectId = getUrlVars()["projectId"];
    }

    /**
    * Calls an Apps Script function to get the data from the Google Sheet
    * Otrzymuje listę elementów, którą nalezy przypisać do repozytorium
    */
   initialise() {
       return new Promise((resolve, reject) => {
           this.initialiseItemsList('getContractsList')
               .then((result) => {  this.items = result;
                                    resolve("Contracts initialised");
                                 });
       });
   }

    setContractChosenFromURL() {
        var contractId = getUrlVars()["contractId"];
        if (contractId!= undefined)
            this.selectedItem = Tools.search(contractId,"id", this.items);
    }
   

    deleteContract(itemId,viewHandler,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(itemId,'deleteContract', viewHandler,viewObject)
                    .then (()=> resolve('Contract deleted'));
        });
    }
}