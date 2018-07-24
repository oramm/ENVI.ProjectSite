class MainWindowView extends Popup{
    
    constructor(){
        super();
        this.navigationBar;
        this.autocomplete;
    }
    
    initialise(){
        this.navigationBar = new PsNavigationBar(this)
        this.autocomplete = new AutoCompleteTextField('projectsPickerAutoComplete','Wybierz projekt');
        this.autocomplete.initialise(projectsRepository,"id", this.onProjectChosen, this)
        
    }
    
    loadDashBoard(){
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    }
    

    onProjectChosen(inputValue){
        this.autocomplete.chosenItem = search(inputValue, "id", projectsRepository.items);
        projectsRepository.currentItem = this.autocomplete.chosenItem;
        this.navigationBar.initialiseMenuItems();
    }
}