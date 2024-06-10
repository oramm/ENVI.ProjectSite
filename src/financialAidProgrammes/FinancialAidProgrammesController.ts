import { EntityData, FinancialAidProgrammeData, NeedData } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";

export const financialAidProgrammesRepository = new RepositoryReact<FinancialAidProgrammeData>({
    actionRoutes: {
        getRoute: "financialAidProgrammes",
        addNewRoute: "financialAidProgramme",
        editRoute: "financialAidProgramme",
        deleteRoute: "financialAidProgramme",
    },
    name: "financialAidProgrammes",
});

export const clientsRepository = new RepositoryReact<EntityData>({
    actionRoutes: {
        getRoute: "entities",
        addNewRoute: "entity",
        editRoute: "entity",
        deleteRoute: "entity",
    },
    name: "clients",
});

export const needsRepository = new RepositoryReact<NeedData>({
    actionRoutes: {
        getRoute: "needs",
        addNewRoute: "need",
        editRoute: "need",
        deleteRoute: "need",
    },
    name: "needs",
});
