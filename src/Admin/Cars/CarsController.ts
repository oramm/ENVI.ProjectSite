import { CarData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

/**
 * Słownik samochodów służbowych (kilometrówka).
 * Trasy za bramką /admin - dostęp mają ADMIN i ENVI_MANAGER.
 */
export const carsRepository = new RepositoryReact<CarData>({
    actionRoutes: {
        getRoute: "admin/cars",
        addNewRoute: "admin/car",
        editRoute: "admin/car",
        deleteRoute: "admin/car",
    },
    name: "cars",
});
