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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingLetterModalBody = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const LetterModalBody_1 = require("./LetterModalBody");
const FormContext_1 = require("../../../View/Modals/FormContext");
const GenericComponents_1 = require("../../../View/Modals/CommonFormComponents/GenericComponents");
const BussinesObjectSelectors_1 = require("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors");
const StatusSelectors_1 = require("../../../View/Modals/CommonFormComponents/StatusSelectors");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
/**Wywoływana w ProjectsSelector jako props  */
function IncomingLetterModalBody(props) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState: { errors }, trigger, control, } = (0, FormContext_1.useFormContext)();
    const fileInputRef = (0, react_1.useRef)(null);
    const [isAnalyzing, setIsAnalyzing] = (0, react_1.useState)(false);
    const [analysisError, setAnalysisError] = (0, react_1.useState)(null);
    const [confidenceScores, setConfidenceScores] = (0, react_1.useState)({});
    const currentStatus = watch("status");
    (0, react_1.useEffect)(() => {
        setValue("_entitiesMain", initialData?._entitiesMain, { shouldDirty: false, shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldDirty: false, shouldValidate: true });
        setValue("status", initialData?.status || MainSetupReact_1.default.IncomingLetterStatus.RESPONSE_REQUIRED, {
            shouldDirty: false,
            shouldValidate: true,
        });
    }, [initialData, setValue]);
    const getConfidenceClass = (fieldName) => {
        // If the form has validation errors for this field, let validation classes take precedence.
        // errors is from useFormContext above.
        // @ts-ignore
        if (errors && errors[fieldName])
            return '';
        const score = confidenceScores[fieldName];
        if (score === 3)
            return 'is-valid';
        if (score === 2)
            return 'is-warning';
        if (score === 1)
            return 'is-warning';
        return '';
    };
    const normalizeDateToISO = (value) => {
        if (!value && value !== 0)
            return null;
        if (value instanceof Date)
            return value.toISOString().split('T')[0];
        if (typeof value !== 'string')
            return null;
        const v = value.trim();
        if (!v)
            return null;
        // If already ISO-like YYYY-MM-DD
        const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch)
            return v;
        // Match dd.mm.yyyy or d.m.yyyy
        const dmy = v.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);
        if (dmy) {
            const day = dmy[1].padStart(2, '0');
            const month = dmy[2].padStart(2, '0');
            const year = dmy[3];
            return `${year}-${month}-${day}`;
        }
        const parsed = new Date(v);
        if (!isNaN(parsed.getTime()))
            return parsed.toISOString().split('T')[0];
        return null;
    };
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setConfidenceScores({});
        const formData = new FormData();
        formData.append('file', file);
        const uploadWithXhr = (url, data) => new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.withCredentials = true;
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const json = JSON.parse(xhr.responseText);
                        resolve(json);
                    }
                    catch (e) {
                        reject(new Error('Invalid JSON response from server'));
                    }
                }
                else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err.errorMessage || xhr.statusText || 'Upload failed'));
                    }
                    catch (_e) {
                        reject(new Error(xhr.statusText || 'Upload failed'));
                    }
                }
            };
            xhr.onerror = () => reject(new Error('Network error during file upload'));
            const fd = new FormData();
            for (const pair of Array.from(data.entries())) {
                const [k, v] = pair;
                if (v instanceof File)
                    fd.append(k, v, v.name);
                else
                    fd.append(k, v);
            }
            xhr.send(fd);
        });
        try {
            const result = await uploadWithXhr(MainSetupReact_1.default.serverUrl + 'letters/analyze', formData);
            //console.log('AI analysis raw result:', result);
            // set returned fields
            const newScores = {};
            for (const key in result) {
                const field = result[key];
                if (field && field.value !== undefined) {
                    let valueToSet = field.value;
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
            }
            catch (e) {
                // ignore
            }
            // set file input to the same File
            if (fileInputRef.current) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    setValue('file', dt.files, { shouldValidate: true, shouldDirty: true });
                }
                catch (e) {
                    console.warn('Could not set file input programmatically', e);
                }
            }
        }
        catch (err) {
            if (err instanceof Error)
                setAnalysisError(err.message);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "fileAnalysis", className: "mb-3 p-3 bg-light border rounded" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "fw-bold" }, "Analiza AI dokumentu"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "file", onChange: handleFileChange, disabled: isAnalyzing, accept: ".pdf,.docx" }),
            react_1.default.createElement(react_bootstrap_1.Form.Text, null, "Za\u0142\u0105cz pismo (PDF lub DOCX), a my spr\u00F3bujemy uzupe\u0142ni\u0107 formularz za Ciebie."),
            isAnalyzing && react_1.default.createElement("div", { className: "mt-2" },
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm" }),
                " Analizowanie dokumentu..."),
            analysisError && react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", className: "mt-2" }, analysisError)),
        react_1.default.createElement("hr", null),
        react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "number" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Numer pisma"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", placeholder: "Podaj numer", isInvalid: !!errors?.number, isValid: !errors?.number, ...register("number"), className: getConfidenceClass("number") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "number" })),
        react_1.default.createElement(LetterModalBody_1.LetterModalBody, { ...props, fileInputRef: fileInputRef, getConfidenceClass: getConfidenceClass }),
        react_1.default.createElement(StatusSelectors_1.IncomingLetterStatusSelector, null),
        currentStatus === MainSetupReact_1.default.IncomingLetterStatus.RESPONSE_SENT && (react_1.default.createElement(react_bootstrap_1.Form.Group, { controlId: "relatedLetterNumber" },
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Odpowied\u017A IK"),
            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", isInvalid: !!errors?.responseIKNumber, isValid: !errors?.responseIKNumber, ...register("responseIKNumber") }),
            react_1.default.createElement(GenericComponents_1.ErrorMessage, { errors: errors, name: "responseIKNumber" }))),
        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Nadawca"),
            react_1.default.createElement(BussinesObjectSelectors_1.EntitySelector, { name: "_entitiesMain", multiple: true })),
        react_1.default.createElement("input", { type: "hidden", ...register("isOur"), value: "false" })));
}
exports.IncomingLetterModalBody = IncomingLetterModalBody;
