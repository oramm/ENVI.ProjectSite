import { SkillDictionaryRecord } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export const skillsDictionaryRepository = new RepositoryReact<SkillDictionaryRecord>({
    actionRoutes: {
        getRoute: "v2/skills/search",
        addNewRoute: "v2/skills",
        editRoute: "v2/skills",
        deleteRoute: "v2/skills",
    },
    name: "skillsDictionary",
});
