class ContractTypesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Typy kontraktów");
        
        $("#tittle").after(new ContractTypesCollapsible('contractTypesCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}