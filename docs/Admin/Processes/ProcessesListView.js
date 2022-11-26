class ProcessesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Procesy");
        
        $("#title").after(new ProcessesCollapsible('processesCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}