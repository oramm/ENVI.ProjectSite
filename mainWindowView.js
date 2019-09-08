class MainWindowView extends Popup{
    
    constructor(){
        super();
        this.navigationBar;
        this.autocomplete;
    }
    
    initialise(){
        this.navigationBar = new PsNavigationBar(this)
        this.autocomplete = new AutoCompleteTextField_1('projectsPickerAutoComplete','Wybierz projekt');
        this.autocomplete.initialise(projectsRepository,"ourId", this.onProjectChosen, this)
        
    }
    
    loadDashBoard(){
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    }
    

    onProjectChosen(inputValue){
        this.autocomplete.chosenItem = search(inputValue, "ourId", projectsRepository.items);
        projectsRepository.currentItem = this.autocomplete.chosenItem;
        this.navigationBar.initialiseMenuItems();
    }
}