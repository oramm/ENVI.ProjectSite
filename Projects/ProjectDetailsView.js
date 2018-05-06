class ProjectDetailsView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        this.setTittle("Informacje o projekcie");
        $('#actionsMenu').after(new ProjectDetailsCollection('projectDetailsCollection').$dom);
        this.dataLoaded(true);
    }
}