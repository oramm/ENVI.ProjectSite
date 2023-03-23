import RepositoryReact from "./RepositoryReact";
import MainSetup from "./MainSetupReact";

export default class MainController {
    static async main() {
        await this.setRepostories();
        console.log('Repositories loaded');
    }

    static async setRepostories() {
        const personsEnviRepository = new RepositoryReact({
            name: 'personsEnvi',
            actionRoutes: {
                getRoute: 'persons',
                addNewRoute: 'persons',
                editRoute: 'persons',
                deleteRoute: 'persons'
            }
        });
        const personsEnviData = new FormData();
        personsEnviData.append('systemRoleName', 'ENVI_EMPLOYEE|ENVI_MANAGER');
        await personsEnviRepository.loadItemsfromServer(personsEnviData);
        personsEnviRepository.saveToSessionStorage();
        MainSetup.personsEnviRepository = personsEnviRepository;

        const contractTypesRepository = new RepositoryReact({
            name: 'contractTypes',
            actionRoutes: {
                getRoute: 'contractTypes',
                addNewRoute: 'contractTypes',
                editRoute: 'contractTypes',
                deleteRoute: 'contractTypes'
            }
        });
        const contractTypesData = new FormData();
        contractTypesData.append('status', 'ACTIVE');
        await contractTypesRepository.loadItemsfromServer();
        contractTypesRepository.saveToSessionStorage();
        MainSetup.contractTypesRepository = contractTypesRepository;

        const documentTemplatesRepository = new RepositoryReact({
            name: 'documentTemplates',
            actionRoutes: {
                getRoute: 'documentTemplates',
                addNewRoute: 'documentTemplates',
                editRoute: 'documentTemplates',
                deleteRoute: 'documentTemplates'
            }
        });
        await documentTemplatesRepository.loadItemsfromServer();
        documentTemplatesRepository.saveToSessionStorage();
        MainSetup.documentTemplatesRepository = documentTemplatesRepository;
    }
}