import { SkillDictionaryRecord } from "../../../Typings/bussinesTypes";
import { SessionTask } from "../../../Typings/sessionTypes";
import RepositoryReact from "../../React/RepositoryReact";
import {
    mapSkillDictionaryDtoToModel,
    mapSkillDictionaryModelToUpsertDto,
    SkillDictionaryDto,
} from "./skillsDictionaryApi";

class SkillsDictionaryRepository extends RepositoryReact<SkillDictionaryRecord> {
    async loadItemsFromServerPOST(
        orConditions: any[] = [],
        specialActionRoute?: string,
        options: { skipCache?: boolean } = { skipCache: false },
    ) {
        const items = (await super.loadItemsFromServerPOST(
            orConditions,
            specialActionRoute,
            options,
        )) as SkillDictionaryDto[];
        this.items = items.map(mapSkillDictionaryDtoToModel);
        if (!options.skipCache) this.saveToSessionStorage();
        return this.items;
    }

    async addNewItem(newItem: any | FormData, specialActionRoute?: string, onProgress?: (task: SessionTask) => void) {
        const payload = newItem instanceof FormData ? newItem : mapSkillDictionaryModelToUpsertDto(newItem);
        const result = (await super.addNewItem(payload, specialActionRoute, onProgress)) as SkillDictionaryDto;
        const mappedResult = mapSkillDictionaryDtoToModel(result);
        this.replaceItemById(mappedResult.id, mappedResult);
        this.currentItems = [mappedResult];
        this.saveToSessionStorage();
        return mappedResult;
    }

    async editItem(
        item: SkillDictionaryRecord | FormData,
        specialActionRoute?: string,
        _fieldsToUpdate?: string[],
        onProgress?: (task: SessionTask) => void,
    ) {
        const payload = item instanceof FormData ? item : { ...item, ...mapSkillDictionaryModelToUpsertDto(item) };
        const result = (await super.editItem(payload, specialActionRoute, _fieldsToUpdate, onProgress)) as SkillDictionaryDto;
        const mappedResult = mapSkillDictionaryDtoToModel(result);
        this.replaceCurrentItemById(mappedResult.id, mappedResult);
        this.replaceItemById(mappedResult.id, mappedResult);
        this.saveToSessionStorage();
        return mappedResult;
    }
}

export const skillsDictionaryRepository = new SkillsDictionaryRepository({
    actionRoutes: {
        getRoute: "v2/skills/search",
        addNewRoute: "v2/skills",
        editRoute: "v2/skills",
        deleteRoute: "v2/skills",
    },
    name: "skillsDictionary",
});
