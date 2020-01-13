class ProcessOurLetterModalController extends OurLetterModalController {
    constructor(modal) {
        super(modal);
    }
    /*
     * Przed dodaniem nowego obiektu trzeba wyczyścić currentItem np. z ourId
     */
    initAddNewDataHandler() {
        super.initAddNewDataHandler();
        LettersSetup.lettersRepository.currentItem = {
            //Ustaw tu parametry kontekstowe jeśli konieczne
            _cases: [casesRepository.currentItem],
            _template: CasesSetup.processesStepsInstancesRepository.currentItem._processStep._documentTemplate,
            _entitiesMain: [],
            _entitiesCc: [],
            _project: LettersSetup.currentProject,
            _editor: {
                name: LettersSetup.currentUser.name,
                surname: LettersSetup.currentUser.surname,
                systemEmail: LettersSetup.currentUser.systemEmail
            },
            _lastUpdated: '',
            _processStepInstance: CasesSetup.processesStepsInstancesRepository.currentItem,
            isOur: true
        };
        
        this.modal.form.fillWithData({
            creationDate: Tools.dateJStoDMY(new Date()),
            registrationDate: Tools.dateJStoDMY(new Date())
        });
    }
};