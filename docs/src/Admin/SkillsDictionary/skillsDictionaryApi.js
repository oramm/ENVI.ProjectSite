"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptionalDescription = normalizeOptionalDescription;
exports.mapSkillDictionaryDtoToModel = mapSkillDictionaryDtoToModel;
exports.mapSkillDictionaryModelToUpsertDto = mapSkillDictionaryModelToUpsertDto;
function normalizeOptionalDescription(value) {
    if (typeof value !== "string")
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function mapSkillDictionaryDtoToModel(dto) {
    return {
        id: dto.id,
        name: dto.name,
        nameNormalized: dto.nameNormalized,
        description: dto.description ?? null,
    };
}
function mapSkillDictionaryModelToUpsertDto(model) {
    return {
        name: model.name || "",
        description: normalizeOptionalDescription(model.description),
    };
}
