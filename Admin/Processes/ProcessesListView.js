class ProcessesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Procesy");
        
        $("#tittle").after(new ProcessesCollapsible('processesCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}