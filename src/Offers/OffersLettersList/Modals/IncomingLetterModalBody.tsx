import React, { useEffect, useRef, useState } from "react";
import { Form, Spinner, Alert } from "react-bootstrap";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { AiUsageInfo, IncomingLetterOffer, OurLetterOffer } from "../../../../Typings/bussinesTypes";
import { AiMetaInfo } from "../../../View/CommonComponents/AiMetaInfo";
import { entitiesRepository } from "../LettersController";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntitySelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import MainSetup from "../../../React/MainSetupReact";
import { EntityData } from "../../../../Typings/bussinesTypes";
import { EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";

/**Wywoływana w ProjectsSelector jako props  */
export function IncomingLetterModalBody(props: ModalBodyProps<OurLetterOffer | IncomingLetterOffer>) {
    const initialData = props.initialData;
    const {
        register,
        setValue,
        watch,
        formState: { errors },
        trigger,
        control,
    } = useFormContext();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
    const [aiMeta, setAiMeta] = useState<{
        _model?: string;
        _usage?: AiUsageInfo;
    } | null>(null);
    const [showCreateSender, setShowCreateSender] = useState(false);

    useEffect(() => {
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldDirty: false, shouldValidate: true });
    }, [initialData, setValue]);

    const getConfidenceClass = (fieldName: string) => {
        // @ts-ignore
        if (errors && (errors as any)[fieldName]) return '';
        const score = confidenceScores[fieldName];
        if (score === 3) return 'is-valid';
        if (score === 2) return 'is-warning';
        if (score === 1) return 'is-warning';
        return '';
    };

    const normalizeDateToISO = (value: any): string | null => {
        if (!value && value !== 0) return null;
        if (value instanceof Date) return value.toISOString().split('T')[0];
        if (typeof value !== 'string') return null;
        const v = value.trim();
        if (!v) return null;
        const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) return v;
        const dmy = v.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);
        if (dmy) {
            const day = dmy[1].padStart(2, '0');
            const month = dmy[2].padStart(2, '0');
            const year = dmy[3];
            return `${year}-${month}-${day}`;
        }
        const parsed = new Date(v);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        return null;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setAnalysisError(null);
        setConfidenceScores({});
        setAiMeta(null);

        const formData = new FormData();
        formData.append('file', file);

        const uploadWithXhr = (url: string, data: FormData) =>
            new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.withCredentials = true;
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const json = JSON.parse(xhr.responseText);
                            resolve(json);
                        } catch (e) {
                            reject(new Error('Invalid JSON response from server'));
                        }
                    } else {
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err.errorMessage || xhr.statusText || 'Upload failed'));
                        } catch (_e) {
                            reject(new Error(xhr.statusText || 'Upload failed'));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during file upload'));
                const fd = new FormData();
                for (const pair of Array.from(data.entries())) {
                    const [k, v] = pair as [string, any];
                    if (v instanceof File) fd.append(k, v, v.name);
                    else fd.append(k, v);
                }
                xhr.send(fd);
            });

        try {
            const result = await uploadWithXhr(MainSetup.serverUrl + 'ai/analyze-document', formData);

            const newScores: Record<string, number> = {};
            for (const key in result) {
                const field = result[key];
                if (field && field.value !== undefined) {
                    let valueToSet: any = field.value;
                    if (key.toLowerCase().includes('date')) {
                        const iso = normalizeDateToISO(valueToSet);
                        valueToSet = iso || "";
                    }
                    setValue(key, valueToSet, { shouldValidate: true, shouldDirty: true });
                }
                if (field && field.confidence) {
                    newScores[key] = field.confidence;
                }
            }
            setConfidenceScores(newScores);
            if (result._model || result._usage) {
                setAiMeta({ _model: result._model, _usage: result._usage });
            }
            try {
                await trigger(["creationDate", "registrationDate", "responseDueDate"] as any);
            } catch (e) {
                // ignore
            }

            if (fileInputRef.current) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    setValue('file', dt.files, { shouldValidate: true, shouldDirty: true });
                } catch (e) {
                    console.warn('Could not set file input programmatically', e);
                }
            }
        } catch (err) {
            if (err instanceof Error) setAnalysisError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <Form.Group controlId="fileAnalysis" className="mb-3 p-3 bg-light border rounded">
                <Form.Label className="fw-bold">Analiza AI dokumentu</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} disabled={isAnalyzing} accept=".pdf,.docx" />
                <Form.Text>Załącz pismo (PDF lub DOCX), a my spróbujemy uzupełnić formularz za Ciebie.</Form.Text>
                {isAnalyzing && <div className="mt-2"><Spinner animation="border" size="sm" /> Analizowanie dokumentu...</div>}
                {analysisError && <Alert variant="danger" className="mt-2">{analysisError}</Alert>}
                {aiMeta && <AiMetaInfo _model={aiMeta._model} _usage={aiMeta._usage} />}
            </Form.Group>

            <hr />
            <Form.Group controlId="number">
                <Form.Label>Numer pisma</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.number}
                    isValid={!errors?.number}
                    {...register("number")}
                    className={getConfidenceClass("number")}
                />
                <ErrorMessage errors={errors} name={"number"} />
            </Form.Group>
            <LetterModalBody {...props} fileInputRef={fileInputRef} getConfidenceClass={getConfidenceClass} />
            <Form.Group>
                <Form.Label>Nadawca</Form.Label>
                <EntitySelector name="_entitiesMain" multiple={true} onRequestCreate={() => setShowCreateSender(true)} />
            </Form.Group>
            <input type="hidden" {...register("isOur")} value="false" />
            <EntityInlineCreateDrawer
                show={showCreateSender}
                onHide={() => setShowCreateSender(false)}
                title="Nowy podmiot (nadawca)"
                repository={entitiesRepository}
                onCreated={(created: EntityData) => {
                    const current = (watch("_entitiesMain") as EntityData[]) || [];
                    setValue("_entitiesMain", [...current, created], { shouldValidate: true });
                }}
            />
        </>
    );
}
