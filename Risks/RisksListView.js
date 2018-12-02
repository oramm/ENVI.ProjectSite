class RisksListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Rejestr Ryzyk");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new RisksCollapsible('risksCollapsible', RisksSetup.risksRepository).$dom);  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
    }
}