class CaseTypesListView extends Popup {
    constructor(){
        super();       
    }
    
    initialise(){
        this.setTittle("Lista typów spraw");
        this.actionsMenuInitialise();
        
        $('#actionsMenu').after(new CaseTypesCollapsible('caseTypesCollapsible').$dom);  
        this.dataLoaded(true);
    }
    actionsMenuInitialise(){
    }
}