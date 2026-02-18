"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileImportModal;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const profileImportApi_1 = require("./profileImportApi");
const ImportPreviewExperiences_1 = __importDefault(require("./ImportPreviewExperiences"));
const ImportPreviewEducations_1 = __importDefault(require("./ImportPreviewEducations"));
const ImportPreviewSkills_1 = __importDefault(require("./ImportPreviewSkills"));
function ProfileImportModal({ personId, show, onHide, onImportDone }) {
    const [step, setStep] = (0, react_1.useState)("upload");
    const [file, setFile] = (0, react_1.useState)(null);
    const [hint, setHint] = (0, react_1.useState)("");
    const [analyzing, setAnalyzing] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [aiResult, setAiResult] = (0, react_1.useState)(null);
    const [selectedExp, setSelectedExp] = (0, react_1.useState)(new Set());
    const [selectedEdu, setSelectedEdu] = (0, react_1.useState)(new Set());
    const [selectedSkill, setSelectedSkill] = (0, react_1.useState)(new Set());
    const [importResult, setImportResult] = (0, react_1.useState)(null);
    function resetState() {
        setStep("upload");
        setFile(null);
        setHint("");
        setAnalyzing(false);
        setError(null);
        setAiResult(null);
        setSelectedExp(new Set());
        setSelectedEdu(new Set());
        setSelectedSkill(new Set());
        setImportResult(null);
    }
    function handleClose() {
        if (step === "done")
            onImportDone();
        resetState();
        onHide();
    }
    function toggleId(set, setter, id) {
        const next = new Set(set);
        if (next.has(id))
            next.delete(id);
        else
            next.add(id);
        setter(next);
    }
    async function handleAnalyze() {
        if (!file)
            return;
        setAnalyzing(true);
        setError(null);
        try {
            const result = await (0, profileImportApi_1.analyzePersonProfileFile)(personId, file, hint.trim() || undefined);
            // Assign _tempId if missing
            result.experiences.forEach((e, i) => (e._tempId = e._tempId ?? i));
            result.educations.forEach((e, i) => (e._tempId = e._tempId ?? i));
            result.skills.forEach((e, i) => (e._tempId = e._tempId ?? i));
            setAiResult(result);
            setSelectedExp(new Set(result.experiences.map((e) => e._tempId)));
            setSelectedEdu(new Set(result.educations.map((e) => e._tempId)));
            setSelectedSkill(new Set(result.skills.map((e) => e._tempId)));
            setStep("preview");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setAnalyzing(false);
        }
    }
    async function handleImport() {
        if (!aiResult)
            return;
        setStep("importing");
        const errors = [];
        const selectedExperiences = aiResult.experiences.filter((e) => selectedExp.has(e._tempId));
        const selectedEducations = aiResult.educations.filter((e) => selectedEdu.has(e._tempId));
        const selectedSkills = aiResult.skills.filter((e) => selectedSkill.has(e._tempId));
        const results = await Promise.allSettled([
            selectedExperiences.length > 0
                ? (0, profileImportApi_1.confirmExperiencesImport)(personId, selectedExperiences)
                : Promise.resolve(null),
            selectedEducations.length > 0
                ? (0, profileImportApi_1.confirmEducationsImport)(personId, selectedEducations)
                : Promise.resolve(null),
            selectedSkills.length > 0
                ? (0, profileImportApi_1.confirmSkillsImport)(personId, selectedSkills)
                : Promise.resolve(null),
        ]);
        const expRes = results[0].status === "fulfilled" ? results[0].value : null;
        const eduRes = results[1].status === "fulfilled" ? results[1].value : null;
        const skillRes = results[2].status === "fulfilled" ? results[2].value : null;
        if (results[0].status === "rejected")
            errors.push(`Doswiadczenie: ${results[0].reason}`);
        if (results[1].status === "rejected")
            errors.push(`Wyksztalcenie: ${results[1].reason}`);
        if (results[2].status === "rejected")
            errors.push(`Umiejetnosci: ${results[2].reason}`);
        setImportResult({
            experiences: expRes ?? undefined,
            educations: eduRes ?? undefined,
            skills: skillRes ?? undefined,
            errors,
        });
        setStep("done");
    }
    const totalSelected = selectedExp.size + selectedEdu.size + selectedSkill.size;
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: handleClose, size: "lg", backdrop: "static" },
        react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
            react_1.default.createElement(react_bootstrap_1.Modal.Title, null, "Import profilu z CV")),
        react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
            error && react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, error),
            step === "upload" && (react_1.default.createElement("div", null,
                react_1.default.createElement("p", null, "Wybierz plik CV (PDF/DOCX):"),
                react_1.default.createElement("input", { type: "file", accept: ".pdf,.docx", className: "form-control mb-3", onChange: (e) => setFile(e.target.files?.[0] ?? null) }),
                react_1.default.createElement("div", { className: "mb-3" },
                    react_1.default.createElement("label", { className: "form-label small text-muted" }, "Wskaz\u00F3wka dla AI (opcjonalnie) \u2014 np. \"to jest CV szkole\u0144\", \"skupi si\u0119 na umiej\u0119tno\u015Bciach technicznych\""),
                    react_1.default.createElement("input", { type: "text", className: "form-control form-control-sm", placeholder: "np. CV zawiera g\u0142\u00F3wnie szkolenia z lat 2010\u20132020", value: hint, onChange: (e) => setHint(e.target.value) })),
                analyzing && (react_1.default.createElement("div", { className: "text-center py-3" },
                    react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                    "Analizowanie pliku...")))),
            step === "preview" && aiResult && (react_1.default.createElement("div", null,
                (aiResult._model || aiResult._usage) && (react_1.default.createElement("div", { className: "text-muted small mb-2" },
                    aiResult._model && react_1.default.createElement("span", { className: "me-3" },
                        "Model: ",
                        react_1.default.createElement("strong", null, aiResult._model)),
                    aiResult._usage && (react_1.default.createElement("span", null,
                        "Tokeny: ",
                        aiResult._usage.promptTokens,
                        " prompt + ",
                        aiResult._usage.completionTokens,
                        " odpowied\u017A = ",
                        react_1.default.createElement("strong", null, aiResult._usage.totalTokens))))),
                react_1.default.createElement(ImportPreviewExperiences_1.default, { items: aiResult.experiences, selectedIds: selectedExp, onToggle: (id) => toggleId(selectedExp, setSelectedExp, id) }),
                react_1.default.createElement(ImportPreviewEducations_1.default, { items: aiResult.educations, selectedIds: selectedEdu, onToggle: (id) => toggleId(selectedEdu, setSelectedEdu, id) }),
                react_1.default.createElement(ImportPreviewSkills_1.default, { items: aiResult.skills, selectedIds: selectedSkill, onToggle: (id) => toggleId(selectedSkill, setSelectedSkill, id) }),
                aiResult.experiences.length === 0 &&
                    aiResult.educations.length === 0 &&
                    aiResult.skills.length === 0 && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "warning" }, "Nie znaleziono danych w pliku CV.")))),
            step === "importing" && (react_1.default.createElement("div", { className: "text-center py-4" },
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", className: "me-2" }),
                react_1.default.createElement("span", null, "Importowanie..."))),
            step === "done" && importResult && (react_1.default.createElement("div", null,
                react_1.default.createElement(react_bootstrap_1.Alert, { variant: importResult.errors.length > 0 ? "warning" : "success" }, "Import zako\u0144czony!"),
                importResult.experiences && (react_1.default.createElement("p", null,
                    "Doswiadczenie: ",
                    importResult.experiences.added.length,
                    " dodane,",
                    " ",
                    importResult.experiences.skipped.length,
                    " pominiete")),
                importResult.educations && (react_1.default.createElement("p", null,
                    "Wyksztalcenie: ",
                    importResult.educations.added.length,
                    " dodane,",
                    " ",
                    importResult.educations.skipped.length,
                    " pominiete")),
                importResult.skills && (react_1.default.createElement("p", null,
                    "Umiejetnosci: ",
                    importResult.skills.added.length,
                    " dodane,",
                    " ",
                    importResult.skills.skipped.length,
                    " pominiete")),
                [
                    ...(importResult.experiences?.warnings ?? []),
                    ...(importResult.educations?.warnings ?? []),
                    ...(importResult.skills?.warnings ?? []),
                ].map((w, i) => (react_1.default.createElement(react_bootstrap_1.Alert, { key: `w${i}`, variant: "warning", className: "py-1 mb-1 small" },
                    "\u26A0 ",
                    w))),
                importResult.errors.map((e, i) => (react_1.default.createElement(react_bootstrap_1.Alert, { key: i, variant: "danger" }, e)))))),
        react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
            step === "upload" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", disabled: !file || analyzing, onClick: handleAnalyze }, "Analizuj")),
            step === "preview" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", disabled: totalSelected === 0, onClick: handleImport },
                "Importuj zaznaczone (",
                totalSelected,
                ")")),
            step === "done" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleClose }, "Zamknij")))));
}
