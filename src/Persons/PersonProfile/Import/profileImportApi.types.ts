import { AiPersonProfileResult, AiProfileEducation, AiProfileExperience, AiProfileSkill, ImportConfirmResponse } from "../../../../Typings/bussinesTypes";

export interface ProfileImportApiAdapter {
    analyzeFile(file: File, hint?: string): Promise<AiPersonProfileResult>;
    confirmExperiences(items: AiProfileExperience[]): Promise<ImportConfirmResponse>;
    confirmEducations(items: AiProfileEducation[]): Promise<ImportConfirmResponse>;
    confirmSkills(items: AiProfileSkill[]): Promise<ImportConfirmResponse>;
}
