class ProjectDetailsView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        this.setTittle("Informacje o projekcie");
        this.projectDetailsCollection = new ProjectDetailsCollection('projectDetailsCollection');
        $('#actionsMenu').after(this.projectDetailsCollection.$dom);
        this.actionsMenuInitialise();
        this.dataLoaded(true);
    }
    actionsMenuInitialise(){        
    }
}