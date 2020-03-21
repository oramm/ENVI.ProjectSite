class ProjectDetailsView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        this.setTittle("Informacje o projekcie");
        this.projectDetailsCollection = new ProjectDetailsCollection('projectDetailsCollection');
        $('#projectDetails').append(this.projectDetailsCollection.$dom);
        $("#processes").append(new ProcessesCollapsible('processCollapsible').$dom);
        
        this.actionsMenuInitialise();
        this.dataLoaded(true);
    }
    actionsMenuInitialise(){        
    }
}