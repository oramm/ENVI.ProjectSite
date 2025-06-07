import { ContractRangeData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const contractRangesRepository = new RepositoryReact<ContractRangeData>({
    actionRoutes: {
        getRoute: "contractRanges",
        addNewRoute: "contractRange",
        editRoute: "contractRange",
        deleteRoute: "contractRange",
    },
    name: "contractRanges",
});
