var meetingsRepository;
var meetingArrangementsRepository;
var contractsRepository;
var milestonesRepository;
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
    
    static get contractsRepository() {
        return contractsRepository;
    }    
    static set contractsRepository(data) {
        contractsRepository = data;
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
    
    static get personsRepository() {
        return personsRepository;
    }
    static set personsRepository(data) {
        personsRepository = data;
    }
}