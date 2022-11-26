"use strict";
var processesInstancesRepository;
var processesInstancesStepsRepository;
var processesStepsInstancesRepository;
class ProcessesInstancesSetup {
    static get processesInstancesRepository() {
        return processesInstancesRepository;
    }
    static set processesInstancesRepository(data) {
        processesInstancesRepository = data;
    }
    static get processesStepsInstancesRepository() {
        return processesStepsInstancesRepository;
    }
    static set processesStepsInstancesRepository(data) {
        processesStepsInstancesRepository = data;
    }
    static get processesStepsInstancesStatusNames() {
        return ['Nie rozpoczęte',
            'W trakcie',
            'Zrobione'
        ];
    }
}
