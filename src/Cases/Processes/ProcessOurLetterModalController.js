class ProcessOurLetterModalController extends OurLetterModalController {
    constructor(modal) {
        super(modal);
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        super.initAddNewDataHandler();
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
    }
};