import { CityData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const citiesRepository = new RepositoryReact<CityData>({
    actionRoutes: {
        getRoute: "cities",
        addNewRoute: "city",
        editRoute: "city",
        deleteRoute: "city",
    },
    name: "cities",
});
