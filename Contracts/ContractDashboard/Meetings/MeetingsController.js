class MeetingsController {
    main() {
        // Hide auth UI, then load client library.
        var listView = new MeetingsListView();
        $("#authorize-div").hide();
        listView.dataLoaded(false);
        //signoutButton.style.display = 'block';


        MeetingsSetup.meetingsRepository = new SimpleRepository('Meetings repository',
            'getMeetingsListPerContract',
            'addNewMeeting',
            'editMeeting',
            'deleteMeeting');

        MeetingsSetup.meetingArrangementsRepository = new SimpleRepository('MeetingArrangements repository',
            'getMeetingArrangementsListPerContract',
            'addNewMeetingArrangement',
            'editMeetingArrangement',
            'deleteMeetingArrangement');

        MeetingsSetup.casesRepository = new SimpleRepository('Cases repository',
            'getCasesListPerProject'
        );
        MeetingsSetup.caseTypesRepository = new SimpleRepository('CaseTypes repository',
            'getCaseTypesList');

        MeetingsSetup.personsRepository = new SimpleRepository('Persons repository',
            'getPersonsNameSurnameEmailList',
        );
        MeetingsSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));

        var promises = [];
        promises[0] = MeetingsSetup.meetingsRepository.initialise(MeetingsSetup.currentContract.id);
        promises[1] = MeetingsSetup.meetingArrangementsRepository.initialise(MeetingsSetup.meetingsRepository.parentItemId);
        promises[2] = MeetingsSetup.casesRepository.initialise({ projectId: MainSetup.currentProject.ourId });
        promises[3] = MeetingsSetup.caseTypesRepository.initialise();
        promises[4] = MeetingsSetup.personsRepository.initialise({ projectId: MeetingsSetup.meetingsRepository.parentItemId });


        Promise.all(promises)
            .then(() => {
                console.log("Repositories initialised");
                listView.initialise();
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