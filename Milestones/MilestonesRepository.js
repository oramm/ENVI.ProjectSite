
class Milestone {
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

class MilestonesRepository extends Repository{
    constructor(){
        super("Milestones List");
        this.selectedProjectId = Tools.getUrlVars()['projectId'];
        this.selectedContractId = Tools.getUrlVars()['contractId'];
    }

    /**
    * Calls an Apps Script function to get the data from the Google Sheet
    * Otrzymuje listę elementów, którą nalezy przypisać do repozytorium
    */
   initialise() {
       return new Promise((resolve, reject) => {
           this.initialiseItemsList('getMilestonesList',this.selectedProjectId)
               .then((result) => {  this.items = result;
                                    resolve("Milestones initialised");
                                 });
       });
   }

 
    /*
     * Krok 2 - Wywoływane przez trigger w klasie pochodnej po Collection
     */
    deleteMilestone(itemId,viewHandler,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(itemId,'deleteMilestone', viewHandler, viewObject)
                    .then (()=> resolve('Milestone deleted'));
        });
    }
}