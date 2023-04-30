class LettersController {
    static main() {
        // Hide auth UI, then load client library.
        var listView = new LettersListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';

        /*  
        LettersSetup.lettersRepository = new SimpleRepository('Letters repository',
            //'getLettersList',
            'addNewLetter',
            'editLetter',
            'deleteLetter');
        */
        LettersSetup.lettersRepository = new SimpleRepository({
            name: 'Letters repository',
            actionsNodeJSSetup: { addNewRoute: 'letter', editRoute: 'letter', deleteRoute: 'letter' },
        });

        LettersSetup.contractsRepository = new SimpleRepository({
            name: 'Contracts repository'
        });


        LettersSetup.milestonesRepository = new SimpleRepository({
            name: 'Milestones repository'
        });

        LettersSetup.casesRepository = new SimpleRepository({
            name: 'Cases repository'
        });

        const promises = [
            LettersSetup.lettersRepository.initialiseNodeJS('letters/?contractId=' + LettersSetup.lettersRepository.parentItemId),
            LettersSetup.contractsRepository.initialiseNodeJS('contracts/?contractId=' + LettersSetup.lettersRepository.parentItemId),
            LettersSetup.milestonesRepository.initialiseNodeJS('milestones/?contractId=' + LettersSetup.lettersRepository.parentItemId),
            LettersSetup.casesRepository.initialiseNodeJS('cases/?contractId=' + LettersSetup.lettersRepository.parentItemId)
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