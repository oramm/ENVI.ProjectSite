
class Task {
    constructor(id, name, milestoneId, deadline, description, ownerId, editUrl, copyUrl){
        this.id = id;
        this.name = name;
        this.milestoneId = milestoneId;
        this.deadline = deadline;
        this.description = description;
        this.ownerId = ownerId;
        this.editUrl = editUrl;
        this.copyUrl = copyUrl;
    }
}

class TasksRepository extends Repository{
    constructor(){
        super("Tasks List");
        this.selectedProjectId = Tools.getUrlVars()['milestoneId'];
        this.selectedContractId = Tools.getUrlVars()['contractId'];
    }

    /**
    * Calls an Apps Script function to get the data from the Google Sheet
    * Otrzymuje listę elementów, którą nalezy przypisać do repozytorium
    */
   initialise() {
       return new Promise((resolve, reject) => {
           this.initialiseItemsList('getTasksList',this.selectedProjectId)
               .then((result) => {  this.items = result;
                                    resolve("Tasks initialised");
                                 });
       });
   }

 

    deleteTask(itemId,viewHandler,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(itemId,'deleteTask', viewHandler,viewObject)
                    .then (()=> resolve('Task deleted'));
        });
    }
}