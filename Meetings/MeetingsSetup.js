var meetingsRepository;
var meetingArrangementsRepository;
var casesRepository;
var personsRepository;

class MeetingsSetup {
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
    
    static get casesRepository() {
        return casesRepository;
    }
    
    static set casesRepository(data) {
        casesRepository = data;
    }
    
        static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
}