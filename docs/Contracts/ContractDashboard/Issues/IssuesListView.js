class IssuesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Zgłoszone problemy");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new IssuesCollapsible('issuesCollapsible').$dom);  
        this.dataLoaded(true);
    }


    actionsMenuInitialise(){
    }
}