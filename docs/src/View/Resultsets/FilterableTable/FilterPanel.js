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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPanel = FilterPanel;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const FormContext_1 = require("../../Modals/FormContext");
const FilterableTableContext_1 = require("./FilterableTableContext");
const yup_1 = require("@hookform/resolvers/yup");
function FilterPanel({ FilterBodyComponent, repository, validationSchema = undefined, }) {
    const [error, setError] = (0, react_1.useState)(null);
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const { setObjects, id, sections, setSections, snapshotMode, sectionsFilterHandlers } = (0, FilterableTableContext_1.useFilterableTableContext)();
    const formMethods = (0, react_hook_form_1.useForm)({
        resolver: validationSchema ? (0, yup_1.yupResolver)(validationSchema) : undefined,
        defaultValues: {},
        mode: "onChange",
    });
    const snapshotName = `filtersableTableSnapshot_${id}`;
    const { reset } = formMethods;
    //odtwórz stan z sessionStorage
    (0, react_1.useEffect)(() => {
        const storedSnapshot = sessionStorage.getItem(snapshotName);
        if (!storedSnapshot)
            return;
        const { criteria } = JSON.parse(storedSnapshot);
        if (!criteria)
            return;
        for (let key in criteria) {
            formMethods.setValue(key, criteria[key]);
        }
    }, []);
    function saveSnapshotToStorage(result) {
        const filterableTableSnapshot = {
            criteria: formMethods.getValues(),
            ...(snapshotMode !== "criteria-only" ? { storedObjects: result || [] } : {}),
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(filterableTableSnapshot));
    }
    async function handleSubmitSearchFlat(data) {
        setIsReady(false);
        setError(null); // Resetowanie stanu błędu przed nowym żądaniem
        try {
            const result = (await repository.loadItemsFromServerPOST([data]));
            setObjects(result);
            saveSnapshotToStorage(result);
        }
        catch (err) {
            if (err instanceof Error)
                setError(err.message || "Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.");
        }
        finally {
            setIsReady(true);
        }
    }
    async function handleSubmitSearchSections(data) {
        if (!sectionsFilterHandlers)
            return;
        setIsReady(false);
        setError(null);
        try {
            const newSections = await sectionsFilterHandlers.onSubmitSections(data);
            setSections(newSections);
            saveSnapshotToStorage();
        }
        catch (err) {
            if (err instanceof Error)
                setError(err.message || "Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.");
        }
        finally {
            setIsReady(true);
        }
    }
    async function handleSubmitSearch(data) {
        if (sectionsFilterHandlers)
            return handleSubmitSearchSections(data);
        return handleSubmitSearchFlat(data);
    }
    const handleReset = () => {
        const allFields = formMethods.getValues();
        const resetValues = Object.keys(allFields).reduce((acc, curr) => {
            acc[curr] = "";
            return acc;
        }, {});
        console.log("Wartości po resecie:", resetValues);
        reset(resetValues);
        if (sectionsFilterHandlers) {
            const newSections = sectionsFilterHandlers.onResetSections();
            setSections(newSections);
            saveSnapshotToStorage();
        }
    };
    return (react_1.default.createElement(FormContext_1.FormProvider, { value: formMethods },
        react_1.default.createElement(react_bootstrap_1.Form, { onSubmit: formMethods.handleSubmit(handleSubmitSearch) },
            react_1.default.createElement(FilterBodyComponent, null),
            error && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setError(null), dismissible: true }, error)),
            react_1.default.createElement(react_bootstrap_1.Row, { xl: 1, className: "mt-2" },
                react_1.default.createElement(react_bootstrap_1.Form.Group, { as: react_bootstrap_1.Col },
                    react_1.default.createElement(react_bootstrap_1.Button, { type: "submit", className: "me-2" },
                        "Szukaj ",
                        !isReady && (react_1.default.createElement(react_bootstrap_1.Spinner, { className: "ml-1", as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true" }))),
                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: handleReset }, "Wyczy\u015B\u0107"))))));
}
