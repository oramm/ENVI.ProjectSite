import { SkillDictionaryRecord } from "../../../Typings/bussinesTypes";

export type SkillDictionaryDto = {
    id: number;
    name: string;
    nameNormalized: string;
    description?: string | null;
};

export type SkillDictionaryUpsertRequestDto = {
    name: string;
    description: string | null;
};

export function normalizeOptionalDescription(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function mapSkillDictionaryDtoToModel(dto: SkillDictionaryDto): SkillDictionaryRecord {
    return {
        id: dto.id,
        name: dto.name,
        nameNormalized: dto.nameNormalized,
        description: dto.description ?? null,
    };
}

export function mapSkillDictionaryModelToUpsertDto(
    model: Partial<Pick<SkillDictionaryRecord, "name" | "description">>,
): SkillDictionaryUpsertRequestDto {
    return {
        name: model.name || "",
        description: normalizeOptionalDescription(model.description),
    };
}
