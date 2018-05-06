class TasksCollection extends Collection {
    constructor(id, caseId){
        super();
        this.id = id;
        this.caseId = caseId;
        
        return this.initialise(id, 
                        this.makeList(), 
                        this, 
                        this.removeHandler,
                        this.selectHandler
                        );
        
    }
    
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
    */
    makeList(){
        var itemsList = [];
        var item;
        for (var i=0; i<tasksRepository.items.length; i++){
            item = {    id: tasksRepository.items[i].id,
                        icon:   'info',
                        title:  tasksRepository.items[i].name,
                        description:    tasksRepository.items[i].description + '<BR>' +
                                        
                                        tasksRepository.items[i].deadline + '<BR>' +
                                        tasksRepository.items[i].status,
                        editUrl: tasksRepository.items[i].editUrl,
                        caseId_Hidden:  tasksRepository.items[i].caseId
                    };
            itemsList.push(item);
            }
        return itemsList.filter((item)=>item.caseId_Hidden==this.caseId);
    }
    
    removeHandler(itemId){
        tasksRepository.deleteTask(itemId, this.tasksListCollection.removeHandler, this.tasksListCollection)
            .catch(err => {
                      console.error(err);
                    });
    }
    
    selectHandler(itemId){
        tasksRepository.itemSelected(itemId);
    }
}