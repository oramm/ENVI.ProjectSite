class ProjectDetailsCollection extends Collection {
    constructor(id){
        super();      
        this.isDeletable=false;
        this.initialise(id,this.makeList());
    }
    
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
    */
    makeList(){
        var itemsList = [];
        
        itemsList[0] = new CollectionItem('projectId',
                                           'info', //icon
                                           projectsRepository.selectedItem.id,
                                           projectsRepository.selectedItem.name
                                          );
        itemsList[1] = new CollectionItem('projectId',
                                           'date_range', //icon
                                           projectsRepository.selectedItem.status,
                                           projectsRepository.selectedItem.startDate + '<BR>' +
                                           projectsRepository.selectedItem.endDate
                                          );
        itemsList[2] = new CollectionItem('projectId',
                                           'info', //icon
                                           projectsRepository.selectedItem.comment,
                                           ''
                                          );
        return itemsList;
    }
}