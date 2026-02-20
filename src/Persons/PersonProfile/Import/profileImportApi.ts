import {
    AiPersonProfileResult,
    AiProfileEducation,
    AiProfileExperience,
    AiProfileSkill,
    ImportConfirmResponse,
} from "../../../../Typings/bussinesTypes";
import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";
import { validatePersonId } from "../../personsV2Helpers";
import { ProfileImportApiAdapter } from "./profileImportApi.types";

function profileUrl(personId: number) {
    return `${MainSetup.serverUrl}v2/persons/${personId}/profile`;
}

export async function analyzePersonProfileFile(
    personId: number,
    file: File,
    hint?: string,
): Promise<AiPersonProfileResult> {
    const validId = validatePersonId(personId, "analyze-file");
    const formData = new FormData();
    formData.append("file", file);
    if (hint) formData.append("hint", hint);

    const result = await ToolsFetch.fetchJsonWithSafeError(
        `${profileUrl(validId)}/analyze-file`,
        {
            method: "POST",
            credentials: "include",
            body: formData,
        },
    );
    return result as AiPersonProfileResult;
}

export async function confirmExperiencesImport(
    personId: number,
    items: AiProfileExperience[],
): Promise<ImportConfirmResponse> {
    const validId = validatePersonId(personId, "import experiences");
    const result = await ToolsFetch.fetchJsonWithSafeError(
        `${profileUrl(validId)}/experiences/import-confirm`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        },
    );
    return result as ImportConfirmResponse;
}

export async function confirmEducationsImport(
    personId: number,
    items: AiProfileEducation[],
): Promise<ImportConfirmResponse> {
    const validId = validatePersonId(personId, "import educations");
    const result = await ToolsFetch.fetchJsonWithSafeError(
        `${profileUrl(validId)}/educations/import-confirm`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        },
    );
    return result as ImportConfirmResponse;
}

export async function confirmSkillsImport(
    personId: number,
    items: AiProfileSkill[],
): Promise<ImportConfirmResponse> {
    const validId = validatePersonId(personId, "import skills");
    const result = await ToolsFetch.fetchJsonWithSafeError(
        `${profileUrl(validId)}/skills/import-confirm`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        },
    );
    return result as ImportConfirmResponse;
}

export function createPersonProfileImportApi(personId: number): ProfileImportApiAdapter {
    return {
        analyzeFile(file, hint) {
            return analyzePersonProfileFile(personId, file, hint);
        },
        confirmExperiences(items) {
            return confirmExperiencesImport(personId, items);
        },
        confirmEducations(items) {
            return confirmEducationsImport(personId, items);
        },
        confirmSkills(items) {
            return confirmSkillsImport(personId, items);
        },
    };
}
