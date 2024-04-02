import { ApplicationCallData } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";

export const applicationCallsRepository = new RepositoryReact<ApplicationCallData>({
    actionRoutes: {
        getRoute: "applicationCalls",
        addNewRoute: "applicationCall",
        editRoute: "applicationCall",
        deleteRoute: "applicationCall",
    },
    name: "applicationCalls",
});
