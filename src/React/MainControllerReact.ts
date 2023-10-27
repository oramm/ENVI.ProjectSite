import RepositoryReact from "./RepositoryReact";
import MainSetup from "./MainSetupReact";
import { ContractType, DocumentTemplate, Person } from "../../Typings/bussinesTypes";

export default class MainController {
    static async main() {
        await this.setRepostories();
        console.log('Repositories loaded');
    }

    static async setRepostories() {
        const personsEnviRepository = new RepositoryReact<Person>({
            name: 'personsEnvi',
            actionRoutes: {
                getRoute: 'persons',
                addNewRoute: 'persons',
                editRoute: 'persons',
                deleteRoute: 'persons'
            }
        });
        await personsEnviRepository.loadItemsFromServerGET({ systemRoleName: 'ENVI_EMPLOYEE|ENVI_MANAGER' });
        personsEnviRepository.saveToSessionStorage();
        MainSetup.personsEnviRepository = personsEnviRepository;

        const contractTypesRepository = new RepositoryReact<ContractType>({
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
        await contractTypesRepository.loadItemsFromServerGET();
        contractTypesRepository.saveToSessionStorage();
        MainSetup.contractTypesRepository = contractTypesRepository;

        const documentTemplatesRepository = new RepositoryReact<DocumentTemplate>({
            name: 'documentTemplates',
            actionRoutes: {
                getRoute: 'documentTemplates',
                addNewRoute: 'documentTemplates',
                editRoute: 'documentTemplates',
                deleteRoute: 'documentTemplates'
            }
        });
        await documentTemplatesRepository.loadItemsFromServerGET();
        documentTemplatesRepository.saveToSessionStorage();
        MainSetup.documentTemplatesRepository = documentTemplatesRepository;
    }
}