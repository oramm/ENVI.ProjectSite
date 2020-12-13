class MainWindowView extends Popup {
    constructor() {
        super();
        this.navigationBar;
        this.autocomplete;
    }

    initialise() {
        this.navigationBar = new PsNavigationBar(this)
        this.autocomplete = new AutoCompleteTextField_1('projectsPickerAutoComplete', 'Wybierz projekt');
        this.autocomplete.initialise(MainSetup.projectsRepository, "_ourId_Alias", this.onProjectChosen, this)

    }

    loadDashBoard() {
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    }


    onProjectChosen(inputValue) {
        this.autocomplete.chosenItem = Tools.search(inputValue, "_ourId_Alias", MainSetup.projectsRepository.items);
        MainSetup.projectsRepository.currentItem = this.autocomplete.chosenItem;
        MainSetup.personsPerProjectRepositoryLocalData.initialiseNodeJS('persons/?projectId=' + this.autocomplete.chosenItem.ourId);
        this.navigationBar.initialiseMenuItems();
        this.navigationBar.menuItemClickHandler(this.navigationBar.menuItems[0].link)
    }
}