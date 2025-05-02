import RepositoryReact from "./RepositoryReact";
import MainSetup from "./MainSetupReact";
import { ContractRangeData, ContractType, DocumentTemplate, PersonData } from "../../Typings/bussinesTypes";

export default class MainController {
    static async main() {
        await this.setRepostories();
        console.log("Repositories loaded");
    }

    static async isSessionSet() {
        const response = await fetch(MainSetup.serverUrl + "session", {
            credentials: "include",
        });
        const sessionInfo = await response.json();
        console.log("Session info", sessionInfo);

        if (sessionInfo.userData) {
            MainSetup.currentUser = sessionInfo.userData;
            return true;
        } else {
            return false;
        }
    }

    static async logout() {
        await fetch(MainSetup.serverUrl + "logout", {
            method: "POST",
            credentials: "include",
        });
        //MainSetup.currentUser = undefined;
    }

    static async setRepostories() {
        const personsEnviRepository = new RepositoryReact<PersonData>({
            name: "personsEnvi",
            actionRoutes: {
                getRoute: "persons",
                addNewRoute: "persons",
                editRoute: "persons",
                deleteRoute: "persons",
            },
        });
        await personsEnviRepository.loadItemsFromServerPOST([{ systemRoleName: "ENVI_EMPLOYEE|ENVI_MANAGER" }]);
        personsEnviRepository.saveToSessionStorage();
        MainSetup.personsEnviRepository = personsEnviRepository;

        const contractTypesRepository = new RepositoryReact<ContractType>({
            name: "contractTypes",
            actionRoutes: {
                getRoute: "contractTypes",
                addNewRoute: "contractTypes",
                editRoute: "contractTypes",
                deleteRoute: "contractTypes",
            },
        });
        const contractTypesData = new FormData();
        contractTypesData.append("status", "ACTIVE");
        await contractTypesRepository.loadItemsFromServerPOST();
        contractTypesRepository.saveToSessionStorage();
        MainSetup.contractTypesRepository = contractTypesRepository;

        const documentTemplatesRepository = new RepositoryReact<DocumentTemplate>({
            name: "documentTemplates",
            actionRoutes: {
                getRoute: "documentTemplates",
                addNewRoute: "documentTemplates",
                editRoute: "documentTemplates",
                deleteRoute: "documentTemplates",
            },
        });
        await documentTemplatesRepository.loadItemsFromServerPOST();
        documentTemplatesRepository.saveToSessionStorage();
        MainSetup.documentTemplatesRepository = documentTemplatesRepository;

        MainSetup.contractRangesRepository = new RepositoryReact<ContractRangeData>({
            actionRoutes: {
                getRoute: "contractRanges",
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "contractRanges",
        });
    }
}
