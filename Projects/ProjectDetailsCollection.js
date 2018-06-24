class ProjectDetailsCollection extends Collection {
    constructor(id){
        super(id);      
        this.isDeletable=false;
        this.initialise(this.makeList());
    }
    
    /*
     * Dodano atrybut z ContractId, żeby szybciej filtorwac widok po stronie klienra zamiast przez SELECT z db
    */
    makeList(){
        var itemsList = [];
        
        itemsList[0] = new CollectionItem('projectId',
                                           'info', //icon
                                           window.parent.projectsRepository.currentItem.id,
                                           window.parent.projectsRepository.currentItem.name
                                          );
        itemsList[1] = new CollectionItem('projectId',
                                           'date_range', //icon
                                           window.parent.projectsRepository.currentItem.status,
                                           window.parent.projectsRepository.currentItem.startDate + '<BR>' +
                                           window.parent.projectsRepository.currentItem.endDate
                                          );
        itemsList[2] = new CollectionItem('projectId',
                                           'info', //icon
                                           window.parent.projectsRepository.currentItem.comment,
                                           ''
                                          );
        return itemsList;
    }
    
    makeItem(dataItem){
        //funkcja zbędna, ale musi być zaimplementowana bo wymaga tego Collection
    }
}