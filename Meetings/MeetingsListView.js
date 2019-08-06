class MeetingsListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Spotkania");
        
        $("#tittle").after(new MeetingsCollapsible('meetingsCollapsible').$dom);  
        this.dataLoaded(true);
        
    }

    
    
}