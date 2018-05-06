class ProjectDetailsView extends Popup {
    constructor(){
        super();
    }
    initialise(){
        this.setTittle("Informacje o projekcie");
        $('#actionsMenu').after(new ProjectDetailsCollection('projectDetailsCollection').$dom);
        this.actionsMenuInitialise();
        this.dataLoaded(true);
    }
    actionsMenuInitialise(){
        var newProjectButton = FormTools.createFlatButton('Edytuj dane ', ()=> window.open(projectsRepository.selectedItem.editUrl,'_blank'));
        $('#actionsMenu').append(newProjectButton);
    }
}