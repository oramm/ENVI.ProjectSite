"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePersonProfileFile = analyzePersonProfileFile;
exports.confirmExperiencesImport = confirmExperiencesImport;
exports.confirmEducationsImport = confirmEducationsImport;
exports.confirmSkillsImport = confirmSkillsImport;
exports.createPersonProfileImportApi = createPersonProfileImportApi;
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const ToolsFetch_1 = __importDefault(require("../../../React/Tools/ToolsFetch"));
const personsV2Helpers_1 = require("../../personsV2Helpers");
function profileUrl(personId) {
    return `${MainSetupReact_1.default.serverUrl}v2/persons/${personId}/profile`;
}
async function analyzePersonProfileFile(personId, file, hint) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "analyze-file");
    const formData = new FormData();
    formData.append("file", file);
    if (hint)
        formData.append("hint", hint);
    const result = await ToolsFetch_1.default.fetchJsonWithSafeError(`${profileUrl(validId)}/analyze-file`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    return result;
}
async function confirmExperiencesImport(personId, items) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "import experiences");
    const result = await ToolsFetch_1.default.fetchJsonWithSafeError(`${profileUrl(validId)}/experiences/import-confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
    return result;
}
async function confirmEducationsImport(personId, items) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "import educations");
    const result = await ToolsFetch_1.default.fetchJsonWithSafeError(`${profileUrl(validId)}/educations/import-confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
    return result;
}
async function confirmSkillsImport(personId, items) {
    const validId = (0, personsV2Helpers_1.validatePersonId)(personId, "import skills");
    const result = await ToolsFetch_1.default.fetchJsonWithSafeError(`${profileUrl(validId)}/skills/import-confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    });
    return result;
}
function createPersonProfileImportApi(personId) {
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
