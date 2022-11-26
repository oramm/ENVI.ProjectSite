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
var ProcessOurLetterModalController = /** @class */ (function (_super) {
    __extends(ProcessOurLetterModalController, _super);
    function ProcessOurLetterModalController(modal) {
        return _super.call(this, modal) || this;
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    ProcessOurLetterModalController.prototype.initAddNewDataHandler = function () {
        _super.prototype.initAddNewDataHandler.call(this);
        this.modal.externalRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [casesRepository.currentItem],
            _template: ProcessesInstancesSetup.processesStepsInstancesRepository.currentItem._processStep._documentTemplate,
            _entitiesMain: [],
            _entitiesCc: [],
            _project: MainSetup.currentProject,
            _editor: {
                name: MainSetup.currentUser.name,
                surname: MainSetup.currentUser.surname,
                systemEmail: MainSetup.currentUser.systemEmail
            },
            _lastUpdated: '',
            isOur: true
        };
        this.modal.form.fillWithData({
            creationDate: Tools.dateJStoDMY(new Date()),
            registrationDate: Tools.dateJStoDMY(new Date())
        });
    };
    return ProcessOurLetterModalController;
}(OurLetterModalController));
;
