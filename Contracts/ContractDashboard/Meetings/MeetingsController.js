class MeetingsController {
    static main() {
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

        MeetingsSetup.milestonesRepository = new SimpleRepository(JSON.parse(sessionStorage.getItem('Milestones repository')));

        var promises = [
            MeetingsSetup.meetingsRepository.initialiseNodeJS('meetings/?contractId=' + MeetingsSetup.meetingsRepository.parentItemId),
            MeetingsSetup.meetingArrangementsRepository.initialiseNodeJS('meetingArrangements/?meetingId=' + MeetingsSetup.meetingsRepository.parentItemId),
            MeetingsSetup.casesRepository.initialiseNodeJS('cases/?projectId=' + MainSetup.currentProject.ourId),
        ]

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