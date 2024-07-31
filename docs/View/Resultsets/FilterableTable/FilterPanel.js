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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterPanel = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_hook_form_1 = require("react-hook-form");
const FormContext_1 = require("../../Modals/FormContext");
const FilterableTableContext_1 = require("./FilterableTableContext");
const yup_1 = require("@hookform/resolvers/yup");
function FilterPanel({ FilterBodyComponent, repository, validationSchema = undefined, }) {
    const [error, setError] = (0, react_1.useState)(null);
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const { setObjects, objects, id } = (0, FilterableTableContext_1.useFilterableTableContext)();
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
        for (let key in criteria) {
            formMethods.setValue(key, criteria[key]);
        }
    }, []);
    async function handleSubmitSearch(data) {
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
    function saveSnapshotToStorage(result) {
        const filterableTableSnapshot = {
            criteria: formMethods.getValues(),
            storedObjects: result,
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(filterableTableSnapshot));
        console.log("Saved snapshot: ", filterableTableSnapshot.storedObjects);
    }
    const handleReset = () => {
        const allFields = formMethods.getValues();
        const resetValues = Object.keys(allFields).reduce((acc, curr) => {
            acc[curr] = "";
            return acc;
        }, {});
        console.log("Wartości po resecie:", resetValues);
        reset(resetValues);
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
exports.FilterPanel = FilterPanel;
