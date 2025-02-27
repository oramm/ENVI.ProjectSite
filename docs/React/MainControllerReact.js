"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RepositoryReact_1 = __importDefault(require("./RepositoryReact"));
const MainSetupReact_1 = __importDefault(require("./MainSetupReact"));
class MainController {
    static async main() {
        await this.setRepostories();
        console.log('Repositories loaded');
    }
    static async setRepostories() {
        const personsEnviRepository = new RepositoryReact_1.default({
            name: 'personsEnvi',
            actionRoutes: {
                getRoute: 'persons',
                addNewRoute: 'persons',
                editRoute: 'persons',
                deleteRoute: 'persons'
            }
        });
        await personsEnviRepository.loadItemsFromServerPOST([{ systemRoleName: 'ENVI_EMPLOYEE|ENVI_MANAGER' }]);
        personsEnviRepository.saveToSessionStorage();
        MainSetupReact_1.default.personsEnviRepository = personsEnviRepository;
        const contractTypesRepository = new RepositoryReact_1.default({
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
        await contractTypesRepository.loadItemsFromServerPOST();
        contractTypesRepository.saveToSessionStorage();
        MainSetupReact_1.default.contractTypesRepository = contractTypesRepository;
        const documentTemplatesRepository = new RepositoryReact_1.default({
            name: 'documentTemplates',
            actionRoutes: {
                getRoute: 'documentTemplates',
                addNewRoute: 'documentTemplates',
                editRoute: 'documentTemplates',
                deleteRoute: 'documentTemplates'
            }
        });
        await documentTemplatesRepository.loadItemsFromServerPOST();
        documentTemplatesRepository.saveToSessionStorage();
        MainSetupReact_1.default.documentTemplatesRepository = documentTemplatesRepository;
    }
}
exports.default = MainController;
