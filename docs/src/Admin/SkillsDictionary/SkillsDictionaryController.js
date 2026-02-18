"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillsDictionaryRepository = void 0;
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
const skillsDictionaryApi_1 = require("./skillsDictionaryApi");
class SkillsDictionaryRepository extends RepositoryReact_1.default {
    async loadItemsFromServerPOST(orConditions = [], specialActionRoute, options = { skipCache: false }) {
        const items = (await super.loadItemsFromServerPOST(orConditions, specialActionRoute, options));
        this.items = items.map(skillsDictionaryApi_1.mapSkillDictionaryDtoToModel);
        if (!options.skipCache)
            this.saveToSessionStorage();
        return this.items;
    }
    async addNewItem(newItem, specialActionRoute, onProgress) {
        const payload = newItem instanceof FormData ? newItem : (0, skillsDictionaryApi_1.mapSkillDictionaryModelToUpsertDto)(newItem);
        const result = (await super.addNewItem(payload, specialActionRoute, onProgress));
        const mappedResult = (0, skillsDictionaryApi_1.mapSkillDictionaryDtoToModel)(result);
        this.replaceItemById(mappedResult.id, mappedResult);
        this.currentItems = [mappedResult];
        this.saveToSessionStorage();
        return mappedResult;
    }
    async editItem(item, specialActionRoute, _fieldsToUpdate, onProgress) {
        const payload = item instanceof FormData ? item : { ...item, ...(0, skillsDictionaryApi_1.mapSkillDictionaryModelToUpsertDto)(item) };
        const result = (await super.editItem(payload, specialActionRoute, _fieldsToUpdate, onProgress));
        const mappedResult = (0, skillsDictionaryApi_1.mapSkillDictionaryDtoToModel)(result);
        this.replaceCurrentItemById(mappedResult.id, mappedResult);
        this.replaceItemById(mappedResult.id, mappedResult);
        this.saveToSessionStorage();
        return mappedResult;
    }
}
exports.skillsDictionaryRepository = new SkillsDictionaryRepository({
    actionRoutes: {
        getRoute: "v2/skills/search",
        addNewRoute: "v2/skills",
        editRoute: "v2/skills",
        deleteRoute: "v2/skills",
    },
    name: "skillsDictionary",
});
