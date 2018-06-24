
class Case {
    constructor(id, name, description, milestoneId, editUrl, copyUrl){
        this.id = id;
        this.name = name;
        this.description = description;
        this.milestoneId = milestoneId;
        this.editUrl = editUrl;
        this.copyUrl = copyUrl;
    }
}

class CasesRepository extends Repository{
    constructor(){
        super("Cases List");
        this.milestoneId = getUrlVars()["milestoneId"];
    }

    /**
    * Calls an Apps Script function to get the data from the Google Sheet
    * Otrzymuje listę elementów, którą nalezy przypisać do repozytorium
    */
   initialise() {
       return new Promise((resolve, reject) => {
           this.initialiseItemsList('getCasesList')
               .then((result) => {  this.items = result;
                                    resolve("Cases initialised");
                                 });
       });
   }

    setMilestoneChosenFromURL() {
        var milestoneId = getUrlVars()["milestoneId"];
        if (milestoneId!= undefined)
            this.selectedItem = Tools.search(milestoneId,"id", this.items);
    }
   

    deleteCase(itemId,viewHandler,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(itemId,'deleteCase', viewHandler,viewObject)
                    .then (()=> resolve('Case deleted'));
        });
    }
}