class CasesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista spraw");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new CasesCollapsible('contratsCollapsible').$dom);  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
    }
}