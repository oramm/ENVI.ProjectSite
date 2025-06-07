import {
    ApplicationCallData,
    Case,
    ExternalOffer,
    Invoice,
    MilestoneDateData,
    OtherContract,
    OurContract,
    OurOffer,
    Security,
    Task,
} from "../../../Typings/bussinesTypes";

import RepositoryReact from "../RepositoryReact";
import ToolsDate from "../Tools/ToolsDate";

export const contractsRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "",
        editRoute: "contract",
        deleteRoute: "",
    },
    name: "dashBoard-Contracts",
});

export const securitiesRepository = new RepositoryReact<Security>({
    actionRoutes: {
        getRoute: "securities",
        addNewRoute: "security",
        editRoute: "security",
        deleteRoute: "security",
    },
    name: "dashBoard-securities",
});

export const milestoneDatesRepository = new RepositoryReact<MilestoneDateData>({
    actionRoutes: {
        getRoute: "milestoneDates",
        addNewRoute: "milestoneDate",
        editRoute: "milestoneDate",
        deleteRoute: "milestoneDate",
    },
    name: "dashBoard-milestoneDates",
});

export const tasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "tasks",
});

export const casesRepository = new RepositoryReact<Case>({
    actionRoutes: {
        getRoute: "cases",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "cases",
});

export const offersRepository = new RepositoryReact<OurOffer | ExternalOffer>({
    actionRoutes: {
        getRoute: "offers",
        addNewRoute: "",
        editRoute: "offer",
        deleteRoute: "",
    },
    name: "offers-dashBoard",
});

export const invoicesRepository = new RepositoryReact<Invoice>({
    actionRoutes: {
        getRoute: "invoices",
        addNewRoute: "",
        editRoute: "invoice",
        deleteRoute: "",
    },
    name: "dashBoard-invoices",
});

export const applicationCallsRepository = new RepositoryReact<ApplicationCallData>({
    actionRoutes: {
        getRoute: "applicationCalls",
        addNewRoute: "",
        editRoute: "applicationCall",
        deleteRoute: "",
    },
    name: "dashBoard-applicationCalls",
});

export class MilestonesBusinessLogic {
    static addTimeCategory = (milestone: MilestoneDateData): MilestoneDateData & { timeCategory: string } => {
        const now = new Date();
        const endDate = new Date(milestone.endDate);
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let timeCategory: string;
        if (daysUntilEnd < 0) {
            timeCategory = "Po terminie";
        } else if (daysUntilEnd <= 7) {
            timeCategory = "Kończące się do 7 dni";
        } else if (daysUntilEnd <= 30) {
            timeCategory = "Kończące się do 30 dni";
        } else {
            timeCategory = "Pozostałe nadchodzące";
        }

        return { ...milestone, timeCategory };
    };

    static processCollection = (milestones: MilestoneDateData[]): (MilestoneDateData & { timeCategory: string })[] => {
        return milestones.map(MilestonesBusinessLogic.addTimeCategory);
    };
}
