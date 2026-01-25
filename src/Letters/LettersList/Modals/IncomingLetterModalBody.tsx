import React, { useEffect, useRef, useState } from "react";
import { Form, Spinner, Alert } from "react-bootstrap";
import { LetterModalBody } from "./LetterModalBody";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { entitiesRepository } from "../LettersController";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntitySelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { IncomingLetterStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import MainSetup from "../../../React/MainSetupReact";

/**Wywoływana w ProjectsSelector jako props  */
export function IncomingLetterModalBody(props: ModalBodyProps<OurLetterContract | IncomingLetterContract>) {
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

    const currentStatus = watch("status");

    useEffect(() => {
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldDirty: false, shouldValidate: true });
        setValue("status", initialData?.status || MainSetup.IncomingLetterStatus.RESPONSE_REQUIRED, {
            shouldDirty: false,
            shouldValidate: true,
        });
    }, [initialData, setValue]);

    const getConfidenceClass = (fieldName: string) => {
        // If the form has validation errors for this field, let validation classes take precedence.
        // errors is from useFormContext above.
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
        // If already ISO-like YYYY-MM-DD
        const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) return v;
        // Match dd.mm.yyyy or d.m.yyyy
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
            const result = await uploadWithXhr(MainSetup.serverUrl + 'letters/analyze', formData);
            //console.log('AI analysis raw result:', result);

            // set returned fields
            const newScores: Record<string, number> = {};
            for (const key in result) {
                const field = result[key];
                if (field && field.value !== undefined) {
                    let valueToSet: any = field.value;
                    if (key.toLowerCase().includes('date')) {
                        const iso = normalizeDateToISO(valueToSet);
                        //console.log(`AI field ${key} original:`, valueToSet, 'normalized:', iso);
                        valueToSet = iso || "";
                    }
                    setValue(key, valueToSet, { shouldValidate: true, shouldDirty: true });
                }
                if (field && field.confidence) {
                    newScores[key] = field.confidence;
                }
            }
            setConfidenceScores(newScores);
            // Re-run validation so errors like responseDueDate are cleared when AI provided valid/empty values
            try {
                await trigger();
            } catch (e) {
                // ignore
            }

            // set file input to the same File
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
            <IncomingLetterStatusSelector />
            {currentStatus === MainSetup.IncomingLetterStatus.RESPONSE_SENT && (
                <Form.Group controlId="relatedLetterNumber">
                    <Form.Label>Odpowiedź IK</Form.Label>
                    <Form.Control
                        type="text"
                        isInvalid={!!errors?.responseIKNumber}
                        isValid={!errors?.responseIKNumber}
                        {...register("responseIKNumber")}
                    />
                    <ErrorMessage errors={errors} name={"responseIKNumber"} />
                </Form.Group>
            )}
            <Form.Group>
                <Form.Label>Nadawca</Form.Label>
                <EntitySelector name="_entitiesMain" multiple={true} />
            </Form.Group>
            <input type="hidden" {...register("isOur")} value="false" />
        </>
    );
}
