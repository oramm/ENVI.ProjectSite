import { FocusAreaData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const focusAreasRepository = new RepositoryReact<FocusAreaData>({
    actionRoutes: {
        getRoute: "focusAreas",
        addNewRoute: "focusArea",
        editRoute: "focusArea",
        deleteRoute: "focusArea",
    },
    name: "focusAreas",
});
