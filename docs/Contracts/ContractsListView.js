class ContractsListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista kontraktów");
        
        $("#title").after(new ContractsCollapsible('contractsCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}