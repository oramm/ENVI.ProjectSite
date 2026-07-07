import { OtherContract, OurContract, Task } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";
import { ContractsWithChildren } from "../TasksGlobal/TasksGlobalTypes";

/**
 * Repozytoria dla Scrumboarda. Osobne instancje (nazwy z sufiksem "Scrumboard"),
 * aby nie kolidować z globalnymi repozytoriami TasksGlobal.
 */

/** Płaska lista kontraktów ENVI (lewy panel) */
export const scrumContractsListRepository = new RepositoryReact<OurContract | OtherContract>({
    actionRoutes: {
        getRoute: "contracts",
        addNewRoute: "contractReact",
        editRoute: "contract",
        deleteRoute: "contract",
    },
    name: "scrumboardContractsList",
});

/** Drzewo kontraktu (prawy panel / moje zadania) */
export const scrumContractsWithChildrenRepository = new RepositoryReact<ContractsWithChildren>({
    actionRoutes: {
        getRoute: "contractsWithChildren",
        addNewRoute: "",
        editRoute: "",
        deleteRoute: "",
    },
    name: "scrumboardContractsWithChildren",
});

/** Zadania w drzewie "Aktualny Sprint" (leaves). Osobne repo od "Moje zadania",
 *  aby kliknięcia wierszy nie myliły się między panelami (repository.items = źródło prawdy). */
export const scrumTasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "task",
        editRoute: "task",
        deleteRoute: "task",
    },
    name: "scrumboardTasks",
});

/** Zadania w drzewie "Moje zadania" (osobne repo). */
export const scrumMyTasksRepository = new RepositoryReact<Task>({
    actionRoutes: {
        getRoute: "tasks",
        addNewRoute: "task",
        editRoute: "task",
        deleteRoute: "task",
    },
    name: "scrumboardMyTasks",
});