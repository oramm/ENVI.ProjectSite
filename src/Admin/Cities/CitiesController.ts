import { City } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const citiesRepository = new RepositoryReact<City>({
    actionRoutes: {
        getRoute: 'cities',
        addNewRoute: 'city',
        editRoute: 'city',
        deleteRoute: 'city'
    },
    name: 'cities'
});