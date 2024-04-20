import {
    CaseType,
    ContractType,
    DocumentTemplate,
    Person,
    Project,
    SystemRole,
    SystemRoleName,
    User,
} from "../../Typings/bussinesTypes";
import RepositoryReact from "./RepositoryReact";
import ToolsDate from "./ToolsDate";

export default class MainSetup {
    static projectsRepository: RepositoryReact<Project>;
    static documentTemplatesRepository: RepositoryReact<DocumentTemplate>;
    static personsEnviRepository: RepositoryReact<Person>;
    static contractTypesRepository: RepositoryReact<ContractType>;

    static CLIENT_ID = "386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com"; //ENVI - nowy test

    static serverUrl = window.location.href.includes("localhost")
        ? "http://localhost:3000/"
        : "https://erp-envi.herokuapp.com/";

    static get currentUser() {
        return JSON.parse(<string>sessionStorage.getItem("Current User")) as User;
    }

    static set currentUser(data) {
        sessionStorage.setItem("Current User", JSON.stringify(data));
    }

    static getCurrentUserAsPerson() {
        const currentUser = this.currentUser;
        return this.personsEnviRepository.items.find((p) => `${p.name} ${p.surname}` === currentUser.userName);
    }

    static get currentProject() {
        return JSON.parse(<string>sessionStorage.getItem("Projects repository")).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(<string>sessionStorage.getItem("Contracts repository")).currentItems[0];
    }

    static InvoiceStatuses = {
        FOR_LATER: "Na później",
        TO_DO: "Do zrobienia",
        DONE: "Zrobiona",
        SENT: "Wysłana",
        PAID: "Zapłacona",
        TO_CORRECT: "Do korekty",
        WITHDRAWN: "Wycofana",
    };

    static ProjectStatuses = {
        NOT_STARTED: "Nie rozpoczęty",
        IN_PROGRESS: "W trakcie",
        FINISHED: "Zakończony",
    };

    static ContractStatuses = {
        NOT_STARTED: "Nie rozpoczęty",
        IN_PROGRESS: "W trakcie",
        FINISHED: "Zakończony",
        ARCHIVAL: "Archiwalny",
    };

    static SecurityStatus = {
        NOT_ISSUED: "Nie wydana",
        ISSUED: "Wydana",
        TO_PROLONG: "Do przedłużenia",
        PROLONGED: "Przedłużona",
        RETURNED_1ST_PART: "Zwrócona 70%",
        RETURNED_2ND_PART: "Zwrócona 100%",
    };

    static TaskStatus = {
        BACKLOG: "Backlog",
        NOT_STARTED: "Nie rozpoczęty",
        IN_PROGRESS: "W trakcie",
        TO_CORRECT: "Do poprawy",
        AWAITING_RESPONSE: "Oczekiwanie na odpowiedź",
        DONE: "Zrobione",
    };

    static OfferStatus = {
        TO_DO: "Do złożenia",
        DONE: "Czekamy na wynik",
        AWARDED: "Wygrana",
        LOST: "Przegrana",
        WITHDRAWN: "Wycofana",
        CANCELED: "Unieważnione",
        NOT_INTERESTED: "Nie składamy",
    };

    static ClientNeedStatus = {
        URGENT: "Pilne",
        IMPORTANT: "Ważne",
        NICE_TO_HAVE: "Miło by było",
        FOR_LATER: "Na później",
        NOT_ACTUAL: "Nie aktualne",
    };

    static ApplicationCallStatus = {
        UNKOWN: "Nieznany",
        SCHEDULED: "Zaplanowany",
        OPEN: "Otwarty",
        CLOSED: "Zamknięty",
    };

    static ElementsNeededForApplication = {
        EIA_DECISION: "DUŚ",
        PFU: "PFU",
        BUILDING_PERMIT: "Pozwolenie na budowę",
        DECISION: "Decyzja lokalizacyjna",
        MPZPT: "MPZPT",
    };

    static OfferBidProcedure = {
        REQUEST_FOR_QUOTATION: "Zapytanie ofertowe",
        TENDER_PL: "Przetarg BZP",
        TENDER_EU: "Przetarg DUUE",
    };

    static OfferForm = {
        EMAIL: "Email",
        PLATFORM: "Platforma",
        PAPER: "Papier",
    };

    static InvoicesFilterInitState = {
        ISSUE_DATE_FROM: ToolsDate.addDays(new Date(), -90).toISOString().slice(0, 10),
        ISSUE_DATE_TO: ToolsDate.addDays(new Date(), +10).toISOString().slice(0, 10),
    };

    static LettersFilterInitState = {
        CREATION_DATE_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        CREATION_DATE_TO: ToolsDate.addDays(new Date(), +5).toISOString().slice(0, 10),
    };

    static OffersFilterInitState = {
        SUBMISSION_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        SUBMISSION_TO: ToolsDate.addDays(new Date(), +14).toISOString().slice(0, 10),
    };

    static readonly SystemRoles: Record<SystemRoleName, SystemRole> = {
        ADMIN: {
            id: 1,
            systemName: "ADMIN",
        },
        ENVI_MANAGER: {
            id: 2,
            systemName: "ENVI_MANAGER",
        },
        ENVI_EMPLOYEE: {
            id: 3,
            systemName: "ENVI_EMPLOYEE",
        },
        ENVI_COOPERATOR: {
            id: 4,
            systemName: "ENVI_COOPERATOR",
        },
        EXTERNAL_USER: {
            id: 5,
            systemName: "EXTERNAL_USER",
        },
    };

    static isRoleAllowed(roles: SystemRoleName[]) {
        return roles.includes(this.currentUser.systemRoleName);
    }
}
