var projectsRepository;
var projects = {};
var chosenProject;
var projectsAutocompleteList={};
var entitiesRepository;

class ProjectsSetup {
    static get projectsRepository() {
        return window.parent.projectsRepository;
    }
    static set projectsRepository(data) {
        projectsRepository = data;
    }
    
    static get entitiesRepository() {
        return entitiesRepository;
    }
    static set entitiesRepository(data) {
        entitiesRepository = data;
    }
}