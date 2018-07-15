class ContractsListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista kontraktów");
        
        $("#tittle").after(new ContractsCollapsible('contractsCollapsible', contractsRepository).$dom);  
        this.dataLoaded(true);
        
    }

    
    
}