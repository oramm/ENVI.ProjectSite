import {
    ContractRangeData,
    ContractType,
    DocumentTemplate,
    PersonData,
    ProjectData,
    SystemRole,
    SystemRoleName,
    User,
} from "../../Typings/bussinesTypes";
import RepositoryReact from "./RepositoryReact";
import ToolsDate from "./Tools/ToolsDate";

export default class MainSetup {
    static projectsRepository: RepositoryReact<ProjectData>;
    static documentTemplatesRepository: RepositoryReact<DocumentTemplate>;
    static personsEnviRepository: RepositoryReact<PersonData>;
    static contractTypesRepository: RepositoryReact<ContractType>;
    static contractRangesRepository: RepositoryReact<ContractRangeData>;

    static CLIENT_ID = "386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com"; //ENVI - nowy test

    static serverUrl = window.location.href.includes("localhost")
        ? "http://localhost:3000/"
        : "https://erp-envi.herokuapp.com/";

    static get isDevEnvironment() {
        return this.serverUrl.includes("localhost") || this.serverUrl.includes("127.0.0.1");
    }

    static get currentUserOrNull(): User | null {
        const rawCurrentUser = sessionStorage.getItem("Current User");

        if (!rawCurrentUser || rawCurrentUser === "null" || rawCurrentUser === "undefined") {
            return null;
        }

        try {
            const parsedUser = JSON.parse(rawCurrentUser) as Partial<User> | null;

            if (!parsedUser) {
                return null;
            }

            if (!parsedUser.systemRoleName || !parsedUser.userName) {
                return null;
            }

            return parsedUser as User;
        } catch {
            return null;
        }
    }

    static get currentUser() {
        const currentUser = this.currentUserOrNull;

        if (!currentUser) {
            throw new Error("Current user is not available yet");
        }

        return currentUser;
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
        READY_FOR_KSEF: "Gotowa do wysłania KSeF",
        SENT_TO_KSEF: "Wysłana do KSeF",
        KSEF_ERROR: "Odrzucona przez KSeF",
        PAID: "Zapłacona",
        TO_CORRECT: "Do korekty",
        WITHDRAWN: "Wycofana",
        CORRECTED: "Skorygowana",
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

    static MilestoneStatus = {
        NOT_STARTED: "Nie rozpoczęty",
        IN_PROGRESS: "W trakcie",
        FINISHED: "Zakończony",
        ARCHIVAL: "Archiwalny",
    };

    static CaseStatus = {
        FOR_LATER: "Na zaś",
        IN_PROGRESS: "W trakcie",
        CLOSED: "Zamknięta",
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
        DECISION_PENDING: "Składamy czy nie?",
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

    static OfferBondStatus = {
        NEW: "Jeszcze nie płacić",
        TO_PAY: "Do zapłacenia",
        PAID: "Zapłacone",
        TO_RENEW: "Do przedłużenia",
        DONE: "Złożone",
        TO_BE_RETURNED: "Do zwrotu",
        RETURNED: "Zwrócone",
    };

    static OfferInvitationMailStatus = {
        NEW: "Nowy",
        TO_OFFER: "Przekazać do ofertowania",
        DONE: "Oferta utworzona",
        REJECTED: "Odrzucony",
    };

    static OfferBondForm = {
        CASH: "Gotówka",
        GUARANTEE: "Gwarancja",
    };

    static OfferEventType = {
        CREATED: "Oferta Utworzona",
        SEND: "Oferta wysłana",
        CHANGED: "Oferta zmieniona",
        AWARDED: "Oferta wygrana",
        LOST: "Oferta przegrana",
        CANCELED: "Przetarg unieważniony",
        WITHDRAWN: "Oferta wycofana",
    };

    static OurLetterStatus = {
        CREATED: "Utworzony",
        TO_CORRECT: "Do poprawy",
        CHANGED: "Zmieniony",
        APPROVED: "Zatwierdzony",
        SENT: "Wysłany",
    };

    static IncomingLetterStatus = {
        REGISTERED: "Zarejestrowany",
        RESPONSE_SENT: "Odpowiedź wysłana", // bardziej naturalna forma
        RESPONSE_REQUIRED: "Wymaga odpowiedzi", // krócej i konkretniej
        NO_RESPONSE_REQUIRED: "Nie wymaga odpowiedzi", // bardziej jednoznaczne
    };

    static LetterEventType = {
        CREATED: "Utworzony",
        TO_CORRECT: "Do poprawy",
        CHANGED: "Zmieniony",
        APPROVED: "Zatwierdzony",
        SENT: "Wysłany",
        CANCELED: "Anulowany",
    };

    static InvoicesFilterInitState = {
        ISSUE_DATE_FROM: ToolsDate.addDays(new Date(), -90).toISOString().slice(0, 10),
        ISSUE_DATE_TO: ToolsDate.addDays(new Date(), +10).toISOString().slice(0, 10),
    };

    static LettersFilterInitState = {
        CREATION_DATE_FROM: ToolsDate.addDays(new Date(), -120).toISOString().slice(0, 10),
        CREATION_DATE_TO: ToolsDate.addDays(new Date(), +5).toISOString().slice(0, 10),
    };

    static ContractsFilterInitState = {
        START_DATE_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        START_DATE_TO: ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10),
        END_DATE_FROM: ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10),
    };

    static SecuritiesFilterInitState = {
        START_DATE_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        START_DATE_TO: ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10),
        FIRST_PART_EXPIRY_DATE_FROM: ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10),
        SECOND_PART_EXPIRY_DATE_FROM: ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10),
    };

    static OffersFilterInitState = {
        SUBMISSION_FROM: ToolsDate.addDays(new Date(), -180).toISOString().slice(0, 10),
        SUBMISSION_TO: ToolsDate.addDays(new Date(), +40).toISOString().slice(0, 10),
        STATUSES: [MainSetup.OfferStatus.TO_DO, MainSetup.OfferStatus.DECISION_PENDING, MainSetup.OfferStatus.DONE],
    };

    static readonly MilestoneDatesFilterInitState = {
        END_DATE_FROM: ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10),
        END_DATE_TO: ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10),
        STATUSES: [
            MainSetup.MilestoneStatus.NOT_STARTED,
            MainSetup.MilestoneStatus.IN_PROGRESS,
            MainSetup.MilestoneStatus.FINISHED,
        ],
    };

    static OffersInvitationMailFilterInitState = {
        INCOMING_DATE_FROM: ToolsDate.addDays(new Date(), -7).toISOString().slice(0, 10),
        INCOMING_DATE_TO: ToolsDate.addDays(new Date(), 0).toISOString().slice(0, 10),
    };

    static readonly SystemRoles: Record<SystemRoleName, SystemRole> = {
        ADMIN: {
            id: 1,
            systemName: "ADMIN",
            description: "Pełny dostęp do systemu",
        },
        ENVI_MANAGER: {
            id: 2,
            systemName: "ENVI_MANAGER",
            description: "Rozszerzone uprawnienia pracownika ENVI – zarządzanie projektami, zadaniami, ofertami i fakturami",
        },
        ENVI_EMPLOYEE: {
            id: 3,
            systemName: "ENVI_EMPLOYEE",
            description: "Pracownik ENVI – praca z projektami i zadaniami",
        },
        ENVI_COOPERATOR: {
            id: 4,
            systemName: "ENVI_COOPERATOR",
            description: "Współpracownik zewnętrzny – dostęp tylko do pism",
        },
        EXTERNAL_USER: {
            id: 5,
            systemName: "EXTERNAL_USER",
            description: "Użytkownik zewnętrzny – domyślnie osoba bez dostępu do wirtyny, po dodaniu maila systemowego dostęp tylko do pism",
        },
    };

    static readonly RoleGroups = {
        EMPLOYER: "Zamawiający",
        ENGINEER: "Inżynier",
        CONTRACTOR: "Wykonawca/Podwykonawcy",
        OTHERS: "Pozostali",
    };

    static isRoleAllowed(roles: SystemRoleName[]) {
        const currentUser = this.currentUserOrNull;

        if (!currentUser) {
            return false;
        }

        return roles.includes(currentUser.systemRoleName);
    }
}
