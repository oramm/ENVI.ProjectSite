class MainWindowView extends Popup{
    
    constructor(){
        super();
        this.navigationBar;
        this.autocomplete;
    }
    
    initialise(){
        this.navigationBar = new PsNavigationBar(this)
        this.autocomplete = new AutoCompleteTextField_1('projectsPickerAutoComplete','Wybierz projekt');
        this.autocomplete.initialise(projectsRepository,"_ourId_Alias", this.onProjectChosen, this)
        
    }
    
    loadDashBoard(){
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    }
    

    onProjectChosen(inputValue){
        this.autocomplete.chosenItem = search(inputValue, "_ourId_Alias", projectsRepository.items);
        projectsRepository.currentItem = this.autocomplete.chosenItem;
        this.navigationBar.initialiseMenuItems();
        this.navigationBar.menuItemClickHandler(this.navigationBar.menuItems[0].link)
    }
}