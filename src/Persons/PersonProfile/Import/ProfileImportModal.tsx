import React, { useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { AiPersonProfileResult, ImportConfirmResponse } from "../../../../Typings/bussinesTypes";
import ImportPreviewEducations from "./ImportPreviewEducations";
import ImportPreviewExperiences from "./ImportPreviewExperiences";
import ImportPreviewSkills from "./ImportPreviewSkills";
import { AiMetaInfo } from "../../../View/CommonComponents/AiMetaInfo";
import { createPersonProfileImportApi } from "./profileImportApi";
import { ProfileImportApiAdapter } from "./profileImportApi.types";

type Step = "upload" | "preview" | "importing" | "done";

interface ImportResult {
    experiences?: ImportConfirmResponse;
    educations?: ImportConfirmResponse;
    skills?: ImportConfirmResponse;
    errors: string[];
}

interface Props {
    show: boolean;
    onHide: () => void;
    onImportDone: () => void;
    personId?: number;
    importApi?: ProfileImportApiAdapter;
    title?: string;
}

export default function ProfileImportModal({ personId, show, onHide, onImportDone, importApi, title }: Props) {
    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [hint, setHint] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [aiResult, setAiResult] = useState<AiPersonProfileResult | null>(null);
    const [selectedExp, setSelectedExp] = useState<Set<number>>(new Set());
    const [selectedEdu, setSelectedEdu] = useState<Set<number>>(new Set());
    const [selectedSkill, setSelectedSkill] = useState<Set<number>>(new Set());

    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const resolvedImportApi = importApi || (personId ? createPersonProfileImportApi(personId) : null);

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
        if (step === "done") onImportDone();
        resetState();
        onHide();
    }

    function toggleId(set: Set<number>, setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) {
        const next = new Set(set);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setter(next);
    }

    async function handleAnalyze() {
        if (!file) return;
        setAnalyzing(true);
        setError(null);
        if (!resolvedImportApi) {
            setAnalyzing(false);
            setError("Brak konfiguracji API importu");
            return;
        }
        try {
            const result = await resolvedImportApi.analyzeFile(file, hint.trim() || undefined);
            // Assign _tempId if missing
            result.experiences.forEach((e, i) => (e._tempId = e._tempId ?? i));
            result.educations.forEach((e, i) => (e._tempId = e._tempId ?? i));
            result.skills.forEach((e, i) => (e._tempId = e._tempId ?? i));

            setAiResult(result);
            setSelectedExp(new Set(result.experiences.map((e) => e._tempId)));
            setSelectedEdu(new Set(result.educations.map((e) => e._tempId)));
            setSelectedSkill(new Set(result.skills.map((e) => e._tempId)));
            setStep("preview");
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setAnalyzing(false);
        }
    }

    async function handleImport() {
        if (!aiResult) return;
        if (!resolvedImportApi) {
            setStep("done");
            setImportResult({ errors: ["Brak konfiguracji API importu"] });
            return;
        }
        setStep("importing");
        const errors: string[] = [];

        const selectedExperiences = aiResult.experiences.filter((e) => selectedExp.has(e._tempId));
        const selectedEducations = aiResult.educations.filter((e) => selectedEdu.has(e._tempId));
        const selectedSkills = aiResult.skills.filter((e) => selectedSkill.has(e._tempId));

        const results = await Promise.allSettled([
            selectedExperiences.length > 0 ? resolvedImportApi.confirmExperiences(selectedExperiences) : Promise.resolve(null),
            selectedEducations.length > 0 ? resolvedImportApi.confirmEducations(selectedEducations) : Promise.resolve(null),
            selectedSkills.length > 0 ? resolvedImportApi.confirmSkills(selectedSkills) : Promise.resolve(null),
        ]);

        const expRes = results[0].status === "fulfilled" ? results[0].value : null;
        const eduRes = results[1].status === "fulfilled" ? results[1].value : null;
        const skillRes = results[2].status === "fulfilled" ? results[2].value : null;

        if (results[0].status === "rejected") errors.push(`Doswiadczenie: ${results[0].reason}`);
        if (results[1].status === "rejected") errors.push(`Wyksztalcenie: ${results[1].reason}`);
        if (results[2].status === "rejected") errors.push(`Umiejetnosci: ${results[2].reason}`);

        setImportResult({
            experiences: expRes ?? undefined,
            educations: eduRes ?? undefined,
            skills: skillRes ?? undefined,
            errors,
        });
        setStep("done");
    }

    const totalSelected = selectedExp.size + selectedEdu.size + selectedSkill.size;

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title || "Import profilu z CV"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {step === "upload" && (
                    <div>
                        <p>Wybierz plik CV (PDF/DOCX):</p>
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            className="form-control mb-3"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                        <div className="mb-3">
                            <label className="form-label small text-muted">
                                Wskazówka dla AI (opcjonalnie) — np. "to jest CV szkoleń", "skupi się na umiejętnościach
                                technicznych"
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="np. CV zawiera głównie szkolenia z lat 2010–2020"
                                value={hint}
                                onChange={(e) => setHint(e.target.value)}
                            />
                        </div>
                        {analyzing && (
                            <div className="text-center py-3">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Analizowanie pliku...
                            </div>
                        )}
                    </div>
                )}

                {step === "preview" && aiResult && (
                    <div>
                        <AiMetaInfo _model={aiResult._model} _usage={aiResult._usage} />
                        <ImportPreviewExperiences
                            items={aiResult.experiences}
                            selectedIds={selectedExp}
                            onToggle={(id) => toggleId(selectedExp, setSelectedExp, id)}
                        />
                        <ImportPreviewEducations
                            items={aiResult.educations}
                            selectedIds={selectedEdu}
                            onToggle={(id) => toggleId(selectedEdu, setSelectedEdu, id)}
                        />
                        <ImportPreviewSkills
                            items={aiResult.skills}
                            selectedIds={selectedSkill}
                            onToggle={(id) => toggleId(selectedSkill, setSelectedSkill, id)}
                        />
                        {aiResult.experiences.length === 0 &&
                            aiResult.educations.length === 0 &&
                            aiResult.skills.length === 0 && (
                                <Alert variant="warning">Nie znaleziono danych w pliku CV.</Alert>
                            )}
                    </div>
                )}

                {step === "importing" && (
                    <div className="text-center py-4">
                        <Spinner animation="border" className="me-2" />
                        <span>Importowanie...</span>
                    </div>
                )}

                {step === "done" && importResult && (
                    <div>
                        <Alert variant={importResult.errors.length > 0 ? "warning" : "success"}>
                            Import zakończony!
                        </Alert>
                        {importResult.experiences && (
                            <p>
                                Doswiadczenie: {importResult.experiences.added.length} dodane,{" "}
                                {importResult.experiences.skipped.length} pominiete
                            </p>
                        )}
                        {importResult.educations && (
                            <p>
                                Wyksztalcenie: {importResult.educations.added.length} dodane,{" "}
                                {importResult.educations.skipped.length} pominiete
                            </p>
                        )}
                        {importResult.skills && (
                            <p>
                                Umiejetnosci: {importResult.skills.added.length} dodane,{" "}
                                {importResult.skills.skipped.length} pominiete
                            </p>
                        )}
                        {[
                            ...(importResult.experiences?.warnings ?? []),
                            ...(importResult.educations?.warnings ?? []),
                            ...(importResult.skills?.warnings ?? []),
                        ].map((w, i) => (
                            <Alert key={`w${i}`} variant="warning" className="py-1 mb-1 small">
                                ⚠ {w}
                            </Alert>
                        ))}
                        {importResult.errors.map((e, i) => (
                            <Alert key={i} variant="danger">
                                {e}
                            </Alert>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {step === "upload" && (
                    <Button variant="primary" disabled={!file || analyzing} onClick={handleAnalyze}>
                        Analizuj
                    </Button>
                )}
                {step === "preview" && (
                    <Button variant="primary" disabled={totalSelected === 0} onClick={handleImport}>
                        Importuj zaznaczone ({totalSelected})
                    </Button>
                )}
                {step === "done" && (
                    <Button variant="primary" onClick={handleClose}>
                        Zamknij
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
