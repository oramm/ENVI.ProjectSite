class MainWindowView extends Popup{
    
    constructor(){
        super();
        this.navigationBar;
        this.autocomplete;
    }
    
    initialise(){
        this.navigationBar = new NavigationBar(this)
        this.autocomplete = new AutoComplete(projectsRepository,"id", this.onProjectChosen, this);
        console.log("ProjectDetailsView initialised");

    }
    

    onProjectChosen(inputValue){
        this.autocomplete.chosenItem = search(inputValue, "id", projectsRepository.items);
        projectsRepository.selectedItem = this.autocomplete.chosenItem;
        this.navigationBar.initialiseMenuItems();
        //this.loadIframe("iframeProjectDetails", 'Projects/projectDetails.html?projectId=' + projectsRepository.selectedItem.id);
        //this.loadIframe("iframeContracts", 'Contracts/ContractsList.html?projectId=' + projectsRepository.selectedItem.id);
        //this.loadIframe("iframePersonRoles", 'PersonRoles/personRoles.html?projectId=' + projectsRepository.selectedItem.id);
    }
}