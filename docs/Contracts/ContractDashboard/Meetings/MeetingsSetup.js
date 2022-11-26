var meetingsRepository;
var meetingArrangementsRepository;
var milestonesRepository;
var casesRepository;

class MeetingsSetup {
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem('Projects repository')).currentItemLocalData;
    }
    
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem('Contracts repository')).currentItemLocalData;
    }
    
    static get meetingsRepository() {
        return meetingsRepository;
    }
    static set meetingsRepository(data) {
        meetingsRepository = data;
    }
    
    static get meetingArrangementsRepository() {
        return meetingArrangementsRepository;
    }
    static set meetingArrangementsRepository(data) {
        meetingArrangementsRepository = data;
    }
    
    static get milestonesRepository() {
        return milestonesRepository;
    }
    static set milestonesRepository(data) {
        milestonesRepository = data;
    }
    
    static get casesRepository() {
        return casesRepository;
    }
    static set casesRepository(data) {
        casesRepository = data;
    }
}