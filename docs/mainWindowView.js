"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MainWindowView = /** @class */ (function (_super) {
    __extends(MainWindowView, _super);
    function MainWindowView() {
        var _this = _super.call(this) || this;
        _this.navigationBar;
        _this.autocomplete;
        return _this;
    }
    MainWindowView.prototype.initialise = function () {
        this.navigationBar = new PsNavigationBar(this);
        this.autocomplete = new AutoCompleteTextField_1('projectsPickerAutoComplete', 'Wybierz projekt');
        this.autocomplete.initialise(MainSetup.projectsRepository, "_ourId_Alias", this.onProjectChosen, this);
    };
    MainWindowView.prototype.loadDashBoard = function () {
        this.loadIframe("iframeMain", 'Dashboard/dashboard.html');
    };
    MainWindowView.prototype.onProjectChosen = function (inputValue) {
        var _this = this;
        this.autocomplete.chosenItem = Tools.search(inputValue, "_ourId_Alias", MainSetup.projectsRepository.items);
        $.ajax({
            type: 'GET',
            url: MainSetup.serverUrl + ("project/" + this.autocomplete.chosenItem.id + "/systemEmail/" + MainSetup.currentUser.systemEmail),
            success: function (response) {
                MainSetup.projectsRepository.currentItem = response;
                _this.navigationBar.initialiseMenuItems();
                _this.navigationBar.menuItemClickHandler(_this.navigationBar.menuItems[0].link);
                console.log('ładuję iframe z danymi projektu');
                console.log('Current project NodeJS: %o', response);
                return (" initialised");
            },
            error: function (xhr, status, err) {
                console.log(xhr.responseText);
            }
        });
        MainSetup.personsPerProjectRepositoryLocalData.initialiseNodeJS('persons/?projectId=' + this.autocomplete.chosenItem.ourId);
    };
    return MainWindowView;
}(Popup));
