class LettersController {
    main() {
        // Hide auth UI, then load client library.
        var listView = new LettersListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';


        LettersSetup.lettersRepository = new SimpleRepository('Letters repository',
            'getLettersListPerProject',
            'addNewLetter',
            'editLetter',
            'deleteLetter');

        LettersSetup.contractsRepository = new SimpleRepository('Contracts repository',
            'getContractsListPerProject'
        );

        LettersSetup.milestonesRepository = new SimpleRepository('Milestones repository',
            'getMilestonesListPerProject'
        );

        LettersSetup.casesRepository = new SimpleRepository('Cases repository',
            'getCasesListPerProject'
        );

        var promises = [
            LettersSetup.lettersRepository.initialise({ projectId: LettersSetup.lettersRepository.parentItemId }),
            LettersSetup.contractsRepository.initialise({ projectId: LettersSetup.lettersRepository.parentItemId }),
            LettersSetup.milestonesRepository.initialise({ projectId: LettersSetup.lettersRepository.parentItemId }),
            LettersSetup.casesRepository.initialise({ projectId: LettersSetup.lettersRepository.parentItemId })
        ];

        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                return listView.initialise();
            })
            .then(() => {
                $('select').material_select();
                $('.modal').modal();
                $('.datepicker').pickadate(MainSetup.datePickerSettings);
                ReachTextArea.reachTextAreaInit();
                Materialize.updateTextFields();
                $('ul.tabs').tabs();
                iFrameResize({ log: false, heightCalculationMethod: 'taggedElement', checkOrigin: false });
            }
            )
            .catch(err => {
                console.error(err);
            });
    }
}