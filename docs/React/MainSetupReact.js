"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ToolsDate_1 = __importDefault(require("./ToolsDate"));
class MainSetup {
    static get currentUser() {
        return JSON.parse(sessionStorage.getItem("Current User"));
    }
    static set currentUser(data) {
        sessionStorage.setItem("Current User", JSON.stringify(data));
    }
    static getCurrentUserAsPerson() {
        const currentUser = this.currentUser;
        return this.personsEnviRepository.items.find((p) => `${p.name} ${p.surname}` === currentUser.userName);
    }
    static get currentProject() {
        return JSON.parse(sessionStorage.getItem("Projects repository")).currentItems[0];
    }
    static get currentContract() {
        return JSON.parse(sessionStorage.getItem("Contracts repository")).currentItems[0];
    }
    static isRoleAllowed(roles) {
        return roles.includes(this.currentUser.systemRoleName);
    }
}
exports.default = MainSetup;
MainSetup.CLIENT_ID = "386403657277-9mh2cnqb9dneoh8lc6o2m339eemj24he.apps.googleusercontent.com"; //ENVI - nowy test
MainSetup.serverUrl = window.location.href.includes("localhost")
    ? "http://localhost:3000/"
    : "https://erp-envi.herokuapp.com/";
MainSetup.InvoiceStatuses = {
    FOR_LATER: "Na później",
    TO_DO: "Do zrobienia",
    DONE: "Zrobiona",
    SENT: "Wysłana",
    PAID: "Zapłacona",
    TO_CORRECT: "Do korekty",
    WITHDRAWN: "Wycofana",
};
MainSetup.ProjectStatuses = {
    NOT_STARTED: "Nie rozpoczęty",
    IN_PROGRESS: "W trakcie",
    FINISHED: "Zakończony",
};
MainSetup.ContractStatuses = {
    NOT_STARTED: "Nie rozpoczęty",
    IN_PROGRESS: "W trakcie",
    FINISHED: "Zakończony",
    ARCHIVAL: "Archiwalny",
};
MainSetup.SecurityStatus = {
    NOT_ISSUED: "Nie wydana",
    ISSUED: "Wydana",
    TO_PROLONG: "Do przedłużenia",
    PROLONGED: "Przedłużona",
    RETURNED_1ST_PART: "Zwrócona 70%",
    RETURNED_2ND_PART: "Zwrócona 100%",
};
MainSetup.TaskStatus = {
    BACKLOG: "Backlog",
    NOT_STARTED: "Nie rozpoczęty",
    IN_PROGRESS: "W trakcie",
    TO_CORRECT: "Do poprawy",
    AWAITING_RESPONSE: "Oczekiwanie na odpowiedź",
    DONE: "Zrobione",
};
MainSetup.OfferStatus = {
    DECISION_PENDING: "Składamy czy nie?",
    TO_DO: "Do złożenia",
    DONE: "Czekamy na wynik",
    AWARDED: "Wygrana",
    LOST: "Przegrana",
    WITHDRAWN: "Wycofana",
    CANCELED: "Unieważnione",
    NOT_INTERESTED: "Nie składamy",
};
MainSetup.ClientNeedStatus = {
    URGENT: "Pilne",
    IMPORTANT: "Ważne",
    NICE_TO_HAVE: "Miło by było",
    FOR_LATER: "Na później",
    NOT_ACTUAL: "Nie aktualne",
};
MainSetup.ApplicationCallStatus = {
    UNKOWN: "Nieznany",
    SCHEDULED: "Zaplanowany",
    OPEN: "Otwarty",
    CLOSED: "Zamknięty",
};
MainSetup.ElementsNeededForApplication = {
    EIA_DECISION: "DUŚ",
    PFU: "PFU",
    BUILDING_PERMIT: "Pozwolenie na budowę",
    DECISION: "Decyzja lokalizacyjna",
    MPZPT: "MPZPT",
};
MainSetup.OfferBidProcedure = {
    REQUEST_FOR_QUOTATION: "Zapytanie ofertowe",
    TENDER_PL: "Przetarg BZP",
    TENDER_EU: "Przetarg DUUE",
};
MainSetup.OfferForm = {
    EMAIL: "Email",
    PLATFORM: "Platforma",
    PAPER: "Papier",
};
MainSetup.OfferBondStatus = {
    NEW: "Jeszcze nie płacić",
    TO_PAY: "Do zapłacenia",
    PAID: "Zapłacone",
    TO_RENEW: "Do przedłużenia",
    DONE: "Złożone",
    TO_BE_RETURNED: "Do zwrotu",
    RETURNED: "Zwrócone",
};
MainSetup.OfferBondForm = {
    CASH: "Gotówka",
    GUARANTEE: "Gwarancja",
};
MainSetup.OfferEventType = {
    CREATED: "Oferta Utworzona",
    SEND: "Oferta wysłana",
    CHANGED: "Oferta zmieniona",
    AWARDED: "Oferta wygrana",
    LOST: "Oferta przegrana",
    CANCELED: "Przetarg unieważniony",
    WITHDRAWN: "Oferta wycofana",
};
MainSetup.InvoicesFilterInitState = {
    ISSUE_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -90).toISOString().slice(0, 10),
    ISSUE_DATE_TO: ToolsDate_1.default.addDays(new Date(), +10).toISOString().slice(0, 10),
};
MainSetup.LettersFilterInitState = {
    CREATION_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10),
    CREATION_DATE_TO: ToolsDate_1.default.addDays(new Date(), +5).toISOString().slice(0, 10),
};
MainSetup.ContractsFilterInitState = {
    START_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10),
    START_DATE_TO: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10),
    END_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10),
};
MainSetup.SecuritiesFilterInitState = {
    START_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -365).toISOString().slice(0, 10),
    START_DATE_TO: ToolsDate_1.default.addDays(new Date(), +600).toISOString().slice(0, 10),
    FIRST_PART_EXPIRY_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10),
    SECOND_PART_EXPIRY_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10),
};
MainSetup.OffersFilterInitState = {
    SUBMISSION_FROM: ToolsDate_1.default.addDays(new Date(), -180).toISOString().slice(0, 10),
    SUBMISSION_TO: ToolsDate_1.default.addDays(new Date(), +40).toISOString().slice(0, 10),
    STATUSES: [MainSetup.OfferStatus.TO_DO, MainSetup.OfferStatus.DECISION_PENDING, MainSetup.OfferStatus.DONE],
};
MainSetup.OffersInvitationMailFilterInitState = {
    INCOMING_DATE_FROM: ToolsDate_1.default.addDays(new Date(), -7).toISOString().slice(0, 10),
    INCOMING_DATE_TO: ToolsDate_1.default.addDays(new Date(), 0).toISOString().slice(0, 10),
};
MainSetup.SystemRoles = {
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
