class CurrentMilestonesView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Bieżące kamienie milowe");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new CurrentMilestonesCollection('currentMilestonesViewCollection').$dom);  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
    }
}