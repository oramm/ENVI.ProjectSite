class MainWindowView extends Popup {
    constructor() {
        super();
        this.navigationBar;
        this.autocomplete;
    }

    initialise() {
        this.navigationBar = new PsNavigationBar(this)
        this.autocomplete = new AutoCompleteTextField_1('projectsPickerAutoComplete', 'Wybierz projekt');
        this.autocomplete.initialise(MainSetup.projectsRepository, "_ourId_Alias", this.onProjectChosen, this);
    }

    loadDashBoard() {
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    }


    onProjectChosen(inputValue) {
        this.autocomplete.chosenItem = Tools.search(inputValue, "_ourId_Alias", MainSetup.projectsRepository.items);
        $.ajax({
            type: 'GET',
            url: MainSetup.serverUrl + `project/${this.autocomplete.chosenItem.id}/systemEmail/${MainSetup.currentUser.systemEmail}`,
            success: (response) => {
                MainSetup.projectsRepository.currentItem = response;
                this.navigationBar.initialiseMenuItems();
                this.navigationBar.menuItemClickHandler(this.navigationBar.menuItems[0].link);

                console.log('ładuję iframe z danymi projektu')
                console.log('Current project NodeJS: %o', response);
                return (" initialised");
            },
            error: (xhr, status, err) => {
                console.log(xhr.responseText);
            }
        });

        MainSetup.personsPerProjectRepositoryLocalData.initialiseNodeJS('persons/?projectId=' + this.autocomplete.chosenItem.ourId);


    }
}