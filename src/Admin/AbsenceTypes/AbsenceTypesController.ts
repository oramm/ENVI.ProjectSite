import { AbsenceTypeData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

/**
 * Słownik typów nieobecności (urlopy, opieka, L4).
 * Trasy za bramką /admin - dostęp mają ADMIN i ENVI_MANAGER.
 */
export const absenceTypesRepository = new RepositoryReact<AbsenceTypeData>({
    actionRoutes: {
        getRoute: "admin/absenceTypes",
        addNewRoute: "admin/absenceType",
        editRoute: "admin/absenceType",
        deleteRoute: "admin/absenceType",
    },
    name: "absenceTypes",
});
