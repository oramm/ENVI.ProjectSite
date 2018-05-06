
class Project {
    constructor(id, name, description, value, startDate, endDate){
        this.id = id;
        this.name = name;
        this.description = description;
        this.value = value;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

class ProjectsRepository extends Repository{
    constructor(){
        super("Projects List");
        this.projectId = getUrlVars()["projectId"];
    }

    /**
    * Calls an Apps Script function to get the data from the Google Sheet
    * Otrzymuje listę elementów, którą nalezy przypisać do repozytorium
    */
   initialise() {
       return new Promise((resolve, reject) => {
           this.initialiseItemsList('getProjectsList')
               .then((result) => {  this.items = result;
                                    this.setProjectChosenFromURL();
                                    resolve("Projects initialised");
                                 });
       });
    }

    setProjectChosenFromURL() {
        var projectId = getUrlVars()["projectId"];
        if (projectId!= undefined)
            this.selectedItem = Tools.search(projectId,"id", this.items);
    }
    
    deleteProject(itemId,viewHandler,viewObject) {
        return new Promise((resolve, reject) => {
            this.deleteItem(itemId,'deleteContract', viewHandler,viewObject)
                    .then (()=> resolve('Project deleted'));
        });
    }
}