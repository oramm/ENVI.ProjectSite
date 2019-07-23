class MilestoneTypesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Typy kamieni milowych");
        
        $("#tittle").after(new MilestoneTypesCollapsible('molestoneTypesCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}